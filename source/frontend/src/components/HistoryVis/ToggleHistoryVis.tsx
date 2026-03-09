import "./StatusHistoryVis.css";

import { Chart as ChartJS, type ChartOptions } from "chart.js";
import { useCallback, useEffect, useRef } from "react";
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

export type Data = { value: boolean; timestamp: number }[];

const toggleColors = ["#ff550780", "#19875480"];

type Point = { x: Date; y: boolean };

const gradient = binaryGradient({
    startColor: toggleColors[0],
    end: 0.4,
    endColor: toggleColors[1],
});

const transformData = (data: Data) => {
    const result: Point[] = [];
    for (let i = 0; i < data.length; i++) {
        const { value, timestamp } = data[i];
        result.push({ x: new Date(timestamp), y: value });
        if (i < data.length - 1) {
            result.push({ x: new Date(data[i + 1].timestamp), y: value });
        }
    }
    return result;
};

export function ToggleHistoryVis({ data }: { data: Data }) {
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
        chartRef.current = new ChartJS(canvasRef.current, {
            type: "line",
            data: {
                labels: ["On", "Off"],
                datasets: [
                    {
                        data: transformData(data),
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
                if (currentData.current![i + j].x !== transformedData[j].x) {
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
                ...transformedData.slice(maxMatch[1])
            );
        } else {
            chartRef.current.data.datasets[0].data = transformedData;
        }
        currentData.current = transformedData;
        chartRef.current.options.scales!.x!.min = Math.min(
            ...transformedData.map(({ x }) => x.getTime())
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
