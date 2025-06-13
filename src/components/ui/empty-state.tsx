import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function EmptyState({ icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      {actions && <div className="flex flex-col gap-2 items-center">{actions}</div>}
    </div>
  );
}
