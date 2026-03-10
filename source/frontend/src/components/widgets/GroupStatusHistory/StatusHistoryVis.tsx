import "./StatusHistoryVis.css";

import { Chart as ChartJS, type ChartOptions } from "chart.js";
import { useCallback, useEffect, useRef } from "react";
import { Status } from "../../../store/metrics/GroupHistory";
import { binaryGradient } from "../../../utils";

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            type: "time",
            time: {
                unit: "hour",
                displayFormats: {
                    hour: "HH:mm:ss",
                },
            },
        },
        y: {
            type: "category",
            labels: ["Warning", "Ok"],
            min: "Warning",
            max: "Ok",
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

type Point = [number, string];

const gradient = binaryGradient({
    startColor: statusColors[Status.Warning],
    end: 0.4,
    endColor: statusColors[Status.Ok],
});

const transformData = (data: Data) => {
    const result: Point[] = [];
    for (let i = 0; i < data.length; i++) {
        const { value, timestamp } = data[i];
        if (value === null) continue;
        result.push([timestamp, value === Status.Warning ? "Warning" : "Ok"]);
    }
    if (result.length === 1) {
        result.push(result[0]);
    }
    result.sort((a, b) => a[0] - b[0]);
    return result;
};

export function StatusHistoryVis({ data }: { data: Data }) {
    const currentData = useRef<Point[] | null>(null);
    if (currentData.current === null) {
        currentData.current = transformData(data);
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS<"line", Point[], string> | null>(null);

    const destroyChart = () => {
        if (!chartRef.current) return;
        chartRef.current.destroy();
    };

    const renderChart = useCallback(() => {
        if (!canvasRef.current) return;
        const transformedData = transformData(data);
        chartRef.current = new ChartJS(canvasRef.current, {
            type: "line",
            data: {
                datasets: [
                    {
                        data: transformedData,
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
        const transformedData = transformData(data);
        let maxMatch = null;
        for (let i = 0; i < currentData.current!.length; i++) {
            let j = 0;
            for (
                ;
                j <
                Math.min(
                    transformedData.length,
                    currentData.current!.length - i
                );
                j++
            ) {
                if (currentData.current![i + j][0] !== transformedData[j][0]) {
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
            if (chartRef.current.canvas !== canvasRef.current) {
                destroyChart();
                renderChart();
            }
            chartRef.current.update();
            chartRef.current.data.datasets[0].data.push(
                ...transformedData.slice(maxMatch[1])
            );
        } else {
            chartRef.current.data.datasets[0].data = transformedData;
        }
        currentData.current = transformedData;
        chartRef.current.options.scales!.x!.min = Math.min(
            ...transformedData.map(([x]) => x)
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
