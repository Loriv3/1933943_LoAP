import "./MetricHistoryVis.css";

import { Chart as ChartJS, type ChartOptions } from "chart.js";
import { useCallback, useEffect, useRef } from "react";
import { binaryGradient, formatUnit, multiStopGradient } from "../../utils";
import { MetricType, type MetricUnit } from "../../store/metrics/MetricHistory";

const chartOptions = (unit: MetricUnit[]) =>
    ({
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
                type: "linear",
                ticks: {
                    callback: (value) => formatUnit(value as number, unit[0]),
                },
            },
        },
        plugins: {
            legend: {
                position: "top" as const,
            },
            tooltip: {
                intersect: false,
                callbacks: {
                    label: (value) =>
                        formatUnit(value.parsed.y as number, unit[0]),
                },
            },
        },
    } satisfies ChartOptions<"line">);

export type Data = { value: (number | string)[]; timestamp: number }[];

const phGradient = multiStopGradient([
    "#ee372280",
    "#ee347980",
    "#f47e2680",
    "#fba82280",
    "#f5ec0880",
    "#a3cc3880",
    "#4db84780",
    "#00924780",
    "#00949580",
    "#5175ba80",
    "#454a9f80",
    "#2a2f8480",
    "#94258b80",
    "#7b277980",
]);

const tempGradient = binaryGradient({
    startColor: "#8080ff80",
    endColor: "#ff808080",
});

const waterGradient = binaryGradient({
    startColor: "#4579e280",
    endColor: "#2d55aa80",
});

const borderColorByType = {
    [MetricType.Ph]: phGradient,
    [MetricType.AQParticleVolumeConcentration]: phGradient,
    [MetricType.AQVolumeVolumeConcentration]: phGradient,
    [MetricType.AQMassVolumeConcentration]: phGradient,
    [MetricType.WaterLevel]: waterGradient,
    [MetricType.Temperature]: tempGradient,
    [MetricType.Humidity]: phGradient,
    [MetricType.Pressure]: phGradient,
    [MetricType.Oxygen]: phGradient,
    [MetricType.CyclesPerHour]: phGradient,
    [MetricType.Radiation]: phGradient,
    [MetricType.Power]: phGradient,
    [MetricType.CumulativePower]: phGradient,
    [MetricType.Voltage]: phGradient,
    [MetricType.Current]: phGradient,
    [MetricType.Flow]: phGradient,
    [MetricType.AirlockState]: phGradient,
};
const backgroundColorByType = {
    [MetricType.Ph]: phGradient,
    [MetricType.AQParticleVolumeConcentration]: phGradient,
    [MetricType.AQVolumeVolumeConcentration]: phGradient,
    [MetricType.AQMassVolumeConcentration]: phGradient,
    [MetricType.WaterLevel]: waterGradient,
    [MetricType.Temperature]: tempGradient,
    [MetricType.Humidity]: phGradient,
    [MetricType.Pressure]: phGradient,
    [MetricType.Oxygen]: phGradient,
    [MetricType.CyclesPerHour]: phGradient,
    [MetricType.Radiation]: phGradient,
    [MetricType.Power]: phGradient,
    [MetricType.CumulativePower]: phGradient,
    [MetricType.Voltage]: phGradient,
    [MetricType.Current]: phGradient,
    [MetricType.Flow]: phGradient,
    [MetricType.AirlockState]: phGradient,
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
    const currentData = useRef<Data | null>(null);
    if (currentData.current === null) {
        currentData.current = data;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS<"line", (number | string)[], Date> | null>(null);

    const destroyChart = () => {
        if (!chartRef.current) return;
        chartRef.current.destroy();
    };

    const renderChart = useCallback(() => {
        if (!canvasRef.current) return;
        chartRef.current = new ChartJS(canvasRef.current, {
            type: "line",
            data: {
                labels: data.map(({ timestamp }) => new Date(timestamp)),
                datasets: [
                    {
                        data: data.map(({ value }) => value[0]),
                        borderColor: borderColorByType[type],
                        backgroundColor: backgroundColorByType[type],
                        fill: true,
                        cubicInterpolationMode: "monotone",
                    },
                ],
            },
            options: chartOptions(unit),
        });
    }, [data, type, unit]);

    useEffect(() => {
        if (!chartRef.current) return;
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
            chartRef.current.data.labels!.splice(0, maxMatch[0]);
            chartRef.current.data.labels!.push(
                ...data
                    .slice(maxMatch[1])
                    .map(({ timestamp }) => new Date(timestamp))
            );
            chartRef.current.data.datasets[0].data!.splice(0, maxMatch[0]);
            chartRef.current.data.datasets[0].data.push(
                ...data.slice(maxMatch[1]).map(({ value }) => value[0])
            );
        } else {
            chartRef.current.data.labels! = data.map(
                ({ timestamp }) => new Date(timestamp)
            );
            chartRef.current.data.datasets[0].data = data.map(
                ({ value }) => value[0]
            );
        }
        currentData.current = data;
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
