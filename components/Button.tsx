import { Text, Pressable, ActivityIndicator, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    className?: string; // Additional classes
}

export default function Button({ title, loading, variant = 'primary', className, disabled, ...props }: ButtonProps) {
    const baseStyles = "flex-row items-center justify-center rounded-lg px-6 py-3 transition-all active:scale-95";

    const variants = {
        primary: "bg-primary shadow-lg shadow-primary/25",
        outline: "border border-gray-300 dark:border-gray-700 bg-transparent",
        ghost: "bg-transparent",
    };

    const textStyles = {
        primary: "font-semibold text-white",
        outline: "font-medium text-gray-800 dark:text-gray-300",
        ghost: "font-medium text-gray-600 dark:text-gray-400",
    };

    const opacity = disabled || loading ? 0.7 : 1;

    return (
        <Pressable
            style={{ opacity }}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : 'gray'} />
            ) : (
                <Text className={`${textStyles[variant]} text-center`}>{title}</Text>
            )}
        </Pressable>
    );
}

