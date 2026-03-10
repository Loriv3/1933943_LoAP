import "./MetricHistoryVis.css";

import { Chart as ChartJS, type ChartOptions } from "chart.js";
import { useCallback, useEffect, useRef } from "react";
import { arrayLast, capitalize, formatValueUnit } from "../../../utils";
import {
    MetricType,
    type MetricUnit,
} from "../../../store/metrics/MetricHistory";
import { colorsByType } from "./historyColorsByMetricType";

const airlockStates = ["Idle", "Pressurizing", "Depressurizing"];

const chartOptions = (type: MetricType, unit: MetricUnit[]) =>
    ({
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
                type: type === MetricType.AirlockState ? "category" : "linear",
                labels:
                    type === MetricType.AirlockState
                        ? airlockStates
                        : undefined,
                ticks:
                    type === MetricType.AirlockState
                        ? {}
                        : {
                              callback: (value) => {
                                  return formatValueUnit(
                                      value as number,
                                      arrayLast(unit)!
                                  );
                              },
                          },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                min: type === MetricType.AirlockState ? "Idle" as any : undefined,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                max: type === MetricType.AirlockState ? "Depressurizing" as any : undefined,
            },
        },
        plugins: {
            legend: {
                position: "top" as const,
            },
            tooltip: {
                intersect: false,
                callbacks:
                    type === MetricType.AirlockState
                        ? undefined
                        : {
                              label: (value) => {
                                  return formatValueUnit(
                                      value.parsed.y as number,
                                      arrayLast(unit)!
                                  );
                              },
                          },
            },
        },
    } satisfies ChartOptions<"line">);

export type Data = { value: (number | string)[]; timestamp: number }[];

type Point = [number, string | number];

const transformData = (type: MetricType, data: Data) => {
    const result: Point[] = [];
    for (let i = 0; i < data.length; i++) {
        let value = data[i].value;
        const timestamp = data[i].timestamp;
        if (type === MetricType.AirlockState) {
            value = [capitalize(value[0] as string)];
        }
        result.push([timestamp, arrayLast(value)!]);
    }
    if (result.length === 1) {
        result.push(result[0]);
    }
    result.sort((a, b) => a[0] - b[0]);
    return result;
};

export function MetricHistoryVis({
    data,
    type,
    unit,
}: {
    data: Data;
    type: MetricType;
    unit: MetricUnit[];
}) {
    const currentData = useRef<Point[] | null>(null);
    if (currentData.current === null) {
        currentData.current = transformData(type, data);
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS<"line", Point[], string> | null>(null);

    const destroyChart = () => {
        if (!chartRef.current) return;
        chartRef.current.destroy();
    };

    const renderChart = useCallback(() => {
        if (!canvasRef.current) return;
        const transformedData = transformData(type, data);
        chartRef.current = new ChartJS(canvasRef.current, {
            type: "line",
            data: {
                datasets: [
                    {
                        data: transformedData,
                        borderColor: colorsByType[type],
                        backgroundColor: colorsByType[type],
                        fill: true,
                        cubicInterpolationMode:
                            type === MetricType.AirlockState
                                ? undefined
                                : "monotone",
                    },
                ],
            },
            options: chartOptions(type, unit),
        });
    }, [data, type, unit]);

    useEffect(() => {
        if (!chartRef.current) return;
        const transformedData = transformData(type, data);
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
        <div className="metric-history-vis">
            <canvas ref={canvasRef} role="img" />
        </div>
    );
}
