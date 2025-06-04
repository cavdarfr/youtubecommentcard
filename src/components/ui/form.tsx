import * as React from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    infoIcon?: React.ReactNode;
}

export function FormInput({
    label,
    error,
    infoIcon,
    className,
    ...props
}: FormInputProps) {
    return (
        <div>
            <label
                htmlFor={props.id}
                className="block text-sm font-medium mb-2"
            >
                <div className="flex items-center gap-2">
                    {label}
                    {infoIcon}
                </div>
            </label>
            <input
                className={cn(
                    "w-full px-4 py-2 border rounded-lg",
                    error && "border-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}

interface FormCheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function FormCheckbox({
    label,
    className,
    ...props
}: FormCheckboxProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                className={cn("w-4 h-4", className)}
                {...props}
            />
            <label htmlFor={props.id} className="text-sm font-medium">
                {label}
            </label>
        </div>
    );
}

interface FormSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
}

export function FormSelect({
    label,
    options,
    error,
    className,
    ...props
}: FormSelectProps) {
    return (
        <div>
            <label
                htmlFor={props.id}
                className="block text-sm font-medium mb-2"
            >
                {label}
            </label>
            <select
                className={cn(
                    "w-full px-4 py-2 border rounded-lg",
                    error && "border-red-500",
                    className
                )}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
