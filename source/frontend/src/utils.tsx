import {
    CategoryScale,
    Chart,
    Filler,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Tooltip,
    type ChartOptions,
    type ChartType,
    type Color,
    type ScriptableContext,
} from "chart.js";
import React, { useEffect, useState } from "react";
import type { MetricUnit } from "./store/metrics/MetricHistory";
import { Status } from "./store/metrics/GroupHistory";

export interface CSSProperties extends React.CSSProperties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: `--${string}`]: any;
}

export function registerChartBasics() {
    Chart.register(
        CategoryScale,
        Filler,
        LinearScale,
        LineController,
        LineElement,
        PointElement,
        TimeSeriesScale,
        Tooltip
    );
}

export const defaultChartOptions = {
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

function dataYToPixelY<TType extends ChartType>(
    ctx: ScriptableContext<TType>,
    value: number
) {
    const dataStartY = ctx.chart.scales.y.min;
    const dataHeightY = ctx.chart.scales.y.max - ctx.chart.scales.y.min;
    const canvasEndY = ctx.chart.chartArea.bottom;
    const canvasHeightY = ctx.chart.chartArea.height;
    return (
        canvasEndY -
        ((value ?? ctx.chart.scales.y.min - dataStartY) / dataHeightY) *
            canvasHeightY
    );
}

export function binaryGradient<TType extends ChartType = "line">({
    startColor,
    endColor,
    start,
    end,
}: {
    startColor: string;
    endColor: string;
    start?: number | null;
    end?: number | null;
}): (ctx: ScriptableContext<TType>) => Color {
    return (ctx) => {
        if (!ctx.chart.chartArea) return startColor;
        const gradient = ctx.chart.ctx.createLinearGradient(
            0,
            dataYToPixelY(ctx, start ?? ctx.chart.scales.y.min),
            0,
            dataYToPixelY(ctx, end ?? ctx.chart.scales.y.max)
        );
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        return gradient;
    };
}

export function multiStopGradient<TType extends ChartType = "line">(
    stops: ({ color: string; value: number } | string)[]
): (ctx: ScriptableContext<TType>) => Color {
    return (ctx) => {
        if (!ctx.chart.chartArea) return "#00000000";
        const dataStartY = ctx.chart.scales.y.min;
        const dataHeightY = ctx.chart.scales.y.max - ctx.chart.scales.y.min;
        const gradient = ctx.chart.ctx.createLinearGradient(
            0,
            dataYToPixelY(ctx, ctx.chart.scales.y.min),
            0,
            dataYToPixelY(ctx, ctx.chart.scales.y.max)
        );
        for (let i = 0; i < stops.length; i++) {
            const stop = stops[i];
            if (typeof stop === "string") {
                gradient.addColorStop((i + 1) / stops.length, stop);
            } else {
                gradient.addColorStop(
                    (stop.value - dataStartY) / dataHeightY,
                    stop.color
                );
            }
        }
        return gradient;
    };
}

function diffSeconds(from: Date, to: Date) {
    return Math.floor((to.getTime() - from.getTime()) / 1000);
}

export function useTimer(date: Date | null) {
    const [seconds, setSeconds] = useState(() =>
        date ? diffSeconds(date, new Date()) : 0
    );
    useEffect(() => {
        if (date) {
            setSeconds(diffSeconds(date!, new Date()));
            const intervalId = setInterval(() => {
                setSeconds(diffSeconds(date!, new Date()));
            }, 1000);
            return () => clearInterval(intervalId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date ? date.getTime() : null]);
    return date ? seconds : null;
}

export function dropTimeSeriesData<T>(arr: T[], maxLength: number) {
    if (arr.length > maxLength) {
        arr.splice(0, arr.length - maxLength);
    }
}

export function arrayLast<T>(arr: T[] | null | undefined): T | null {
    return arr?.length ? arr[arr.length - 1] : null;
}

export function formatUnit(value: string | number, unit: MetricUnit) {
    switch (unit) {
        case "pH":
            return `pH ${(value as number).toFixed(2)}`;
        case "ppm":
            return `${(value as number).toFixed(2)} ppm`;
        case "ppb":
            return `${(value as number).toFixed(2)} ppb`;
        case "%":
            return `${(value as number).toFixed(2)}%`;
        case "ug/m3":
            return `${(value as number).toFixed(2)} ug/m3`;
        case "L":
            return `${(value as number).toFixed(2)} L`;
        case "C":
            return `${(value as number).toFixed(1)} °C`;
        case "kPa":
            return `${((value as number) * 10).toFixed(2)} hPa`;
        case "cyc/h":
            return `${(value as number).toFixed(3)} cyc/h`;
        case "uSv/h":
            return `${(value as number).toFixed(2)} uSv/h`;
        case "kW":
            return `${((value as number) / 1000).toFixed(2)} kW`;
        case "kWh":
            return `${((value as number) / 1000).toFixed(2)} kWh`;
        case "V":
            return `${(value as number).toFixed(2)} V`;
        case "A":
            return `${(value as number).toFixed(2)} A`;
        case "L/min":
            return `${(value as number).toFixed(2)} L/min`;
        case "":
            return capitalize(value as string);
    }
}

export const statusToBootstrapColor = {
    [Status.Ok]: "success",
    [Status.Warning]: "warning",
};

export const capitalize = (value: string) => {
    console.log(value);
    return value.charAt(0).toLocaleUpperCase() + value.slice(1);
};
