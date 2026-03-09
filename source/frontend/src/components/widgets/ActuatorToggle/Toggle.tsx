import { Spinner } from "react-bootstrap";
import "./Toggle.css";

export function Toggle({
    state,
    size,
    onClick,
}: {
    state: boolean | null;
    size: number;
    onClick: () => void;
}) {
    return (
        <button
            className={`toggle toggle-${
                state === null ? "unknown" : state ? "on" : "off"
            }`}
            style={{ fontSize: `${size}em` }}
            onClick={onClick}
            disabled={state === null}
        >
            <div className="toggle-inner">
                <div className="toggle-inner-spinner">
                    <Spinner className="toggle-inner-spinner" />
                </div>
            </div>
        </button>
    );
}
