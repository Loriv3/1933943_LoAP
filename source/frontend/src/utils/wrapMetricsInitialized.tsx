import { useAppSelector } from "../store/store";

export const wrapMetricsInitialized =
    <T,>(WrappedElement: React.FC<T>): React.FC<T> =>
    (props: T) => {
        const metricsAreInitialized = useAppSelector(
            (state) => state.init.metricsAreInitialized
        );
        const intrinsicAttributes = {} as React.JSX.IntrinsicAttributes;
        return metricsAreInitialized ? (
            <WrappedElement
                {...props}
                {...intrinsicAttributes}
            ></WrappedElement>
        ) : (
            <></>
        );
    };
