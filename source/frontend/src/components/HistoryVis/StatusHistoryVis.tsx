import "./StatusHistoryVis.css";

import { Chart as ChartJS, type ChartOptions } from "chart.js";
import { useCallback, useEffect, useRef } from "react";
import { Status } from "../../store/metrics/GroupHistory";
import { binaryGradient } from "../../utils";

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            type: "timeseries",
            time: {
                unit: "hour",
                displayFormats: {
                    hour: "HH:mm:ss",
                },
            },
        },
        y: {
            type: "category",
        },
    },
    plugins: {
        legend: {
            position: "top" as const,
        },
        tooltip: {
            intersect: false,
        },
    },
} satisfies ChartOptions<"line">;

export type Data = { value: Status; timestamp: number }[];

const statusColors = {
    [Status.Ok]: "#ffc10780",
    [Status.Warning]: "#19875480",
};

type Point = { x: Date; y: Status };

const gradient = binaryGradient({
    startColor: statusColors[Status.Warning],
    end: 0.4,
    endColor: statusColors[Status.Ok],
});

export function StatusHistoryVis({ data }: { data: Data }) {
    const currentData = useRef<Data | null>(null);
    if (currentData.current === null) {
        currentData.current = data;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS<"line", Point[], Status> | null>(null);

    const destroyChart = () => {
        if (!chartRef.current) return;
        chartRef.current.destroy();
    };

    const renderChart = useCallback(() => {
        if (!canvasRef.current) return;
        chartRef.current = new ChartJS(canvasRef.current, {
            type: "line",
            data: {
                labels: [Status.Warning, Status.Ok],
                datasets: [
                    {
                        data: data.map(({ value, timestamp }) => ({
                            x: new Date(timestamp),
                            y: value,
                        })),
                        borderColor: gradient,
                        backgroundColor: gradient,
                        fill: true,
                        cubicInterpolationMode: "monotone",
                    },
                ],
            },
            options: chartOptions,
        });
    }, [data]);

    useEffect(() => {
        if (!chartRef.current) return;
        console.log(chartRef.current.data.datasets[0].data);
        let maxMatch = null;
        for (let i = 0; i < currentData.current!.length; i++) {
            let j = 0;
            for (
                ;
                j < Math.min(data.length, currentData.current!.length - i);
                j++
            ) {
                if (
                    currentData.current![i + j].timestamp !== data[j].timestamp
                ) {
                    break;
                }
            }
            if (maxMatch === null || j > maxMatch[1]) {
                maxMatch = [i, j];
            }
        }
        if (
            maxMatch &&
            maxMatch[1] >= currentData.current!.length / 2 &&
            currentData.current!.length >= 10
        ) {
            // Add labels to the end instead of resetting the data
            chartRef.current.data.datasets[0].data!.splice(0, maxMatch[0]);
            chartRef.current.data.datasets[0].data.push(
                ...data.slice(maxMatch[1]).map(({ timestamp, value }) => ({
                    x: new Date(timestamp),
                    y: value,
                }))
            );
        } else {
            chartRef.current.data.datasets[0].data = data.map(
                ({ timestamp, value }) => ({ x: new Date(timestamp), y: value })
            );
        }
        currentData.current = data;
        chartRef.current.options.scales!.x!.min = Math.min(
            ...data.map(({ timestamp }) => timestamp)
        );
        if (chartRef.current.canvas !== canvasRef.current) {
            destroyChart();
            renderChart();
        }
        chartRef.current.update();
    }, [data, renderChart]);

    useEffect(() => {
        destroyChart();
        renderChart();
        return () => destroyChart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="status-history-vis">
            <canvas ref={canvasRef} role="img" />
        </div>
    );
}
