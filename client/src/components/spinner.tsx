interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

function LoadingSpinner({ size = 32, label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-8">
      <span
        className="animate-spin rounded-full border-[3px] border-border border-t-primary"
        style={{ width: size, height: size }}
      />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
