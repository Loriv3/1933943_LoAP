import { Status, type GroupSpec } from "./GroupState";
import type { AddGroupValueData } from "./metrics";
import { MetricType } from "./MetricState";

export const testGroups: GroupSpec[] = [
    {
        id: "air_quality.voc_co2e",
        name: "Air Quality",
        subtitle: "VOC/CO2e",
        hasStatus: true,
        metrics: {
            voc: {
                id: "voc",
                name: "VOC",
                type: MetricType.AQParticleVolumeConcentration,
                unit: ["ppb"],
            },
            co2e: {
                id: "co2e",
                name: "CO2e",
                type: MetricType.AQParticleVolumeConcentration,
                unit: ["ppm"],
            },
        },
    },
    {
        id: "entrance_humidity",
        name: "Entrance Humidity",
        subtitle: null,
        hasStatus: true,
        metrics: {
            humidity: {
                id: "humidity",
                name: "Humidity",
                type: MetricType.Humidity,
                unit: ["%"],
            },
        },
    },
    {
        id: "water_tank",
        name: "Water Tank",
        subtitle: null,
        hasStatus: false,
        metrics: {
            water_level: {
                id: "water_level",
                name: "Water Level",
                type: MetricType.WaterLevel,
                unit: ["%", "L"],
            },
        },
    },
    {
        id: "radiation.radiation-monitor.habitat-alpha",
        name: "Radiation",
        subtitle: "Radiation Monitor, Habitat Alpha",
        hasStatus: true,
        metrics: {
            radiation: {
                id: "radiation",
                name: "Radiation",
                type: MetricType.Radiation,
                unit: ["Sv/h"],
            },
        },
    },
];

export const testData = (): AddGroupValueData[] => [
    {
        groupId: "air_quality.voc_co2e",
        date: new Date(),
        status: Math.random() > 0.5 ? Status.Warning : Status.Ok,
        metricValues: {
            voc: [580 + Math.random() * 20],
            co2e: [560 + Math.random() * 20],
        },
    },
    {
        groupId: "water_tank",
        date: new Date(),
        status: null,
        metricValues: {
            water_level: [Math.random(), Math.random() * 72.352],
        },
    },
];
