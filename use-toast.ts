@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Palette industrielle / nucléaire : bleu marine profond + accent orange EDF */
    --background: 220 20% 97%;
    --foreground: 220 25% 12%;

    --card: 0 0% 100%;
    --card-foreground: 220 25% 12%;

    --popover: 0 0% 100%;
    --popover-foreground: 220 25% 12%;

    --primary: 214 72% 25%;
    --primary-foreground: 0 0% 100%;

    --secondary: 220 14% 92%;
    --secondary-foreground: 220 25% 20%;

    --muted: 220 14% 94%;
    --muted-foreground: 220 10% 50%;

    --accent: 28 95% 52%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --border: 220 13% 88%;
    --input: 220 13% 88%;
    --ring: 214 72% 35%;

    --radius: 0.5rem;

    /* Spécifiques à l'app */
    --col-fait-bg: 142 71% 45%;
    --col-fait-bg-checked: 142 76% 36%;
    --header-bg: 214 72% 25%;
    --header-text: 0 0% 100%;
    --row-meca: 214 30% 96%;
    --row-elec: 28 40% 97%;
    --row-hover: 214 50% 93%;
  }

  .dark {
    --background: 220 25% 9%;
    --foreground: 220 15% 92%;
    --card: 220 22% 13%;
    --card-foreground: 220 15% 92%;
    --popover: 220 22% 13%;
    --popover-foreground: 220 15% 92%;
    --primary: 214 72% 55%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 18% 18%;
    --secondary-foreground: 220 15% 80%;
    --muted: 220 18% 18%;
    --muted-foreground: 220 10% 55%;
    --accent: 28 95% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 18% 22%;
    --input: 220 18% 22%;
    --ring: 214 72% 55%;
    --row-meca: 214 25% 12%;
    --row-elec: 220 20% 14%;
    --row-hover: 214 35% 17%;
    --header-bg: 214 72% 18%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 13px;
  }
}

/* Scrollbar fine */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: hsl(var(--muted)); }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }

/* Checkbox personnalisée */
.fait-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: hsl(var(--col-fait-bg-checked));
}

/* Cellules du tableau */
.table-header-group th {
  background: hsl(var(--header-bg));
  color: hsl(var(--header-text));
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 8px 6px;
  white-space: nowrap;
  border: 1px solid hsl(var(--header-bg) / 0.6);
}

.data-row {
  transition: background 0.15s ease;
}
.data-row:hover {
  background: hsl(var(--row-hover)) !important;
}
.data-row.meca {
  background: hsl(var(--row-meca));
}
.data-row.elec {
  background: hsl(var(--row-elec));
}
.data-row td {
  padding: 5px 6px;
  border: 1px solid hsl(var(--border));
  vertical-align: middle;
}

/* Input commentaire */
.comment-input {
  width: 100%;
  min-width: 120px;
  font-size: 11px;
  padding: 3px 5px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 3px;
  transition: border-color 0.15s, background 0.15s;
}
.comment-input:focus {
  outline: none;
  border-color: hsl(var(--primary));
  background: hsl(var(--card));
}

/* Badge spécialité */
.badge-meca {
  @apply inline-block px-1.5 py-0.5 rounded text-xs font-bold;
  background: hsl(214 72% 25%);
  color: white;
}
.badge-elec {
  @apply inline-block px-1.5 py-0.5 rounded text-xs font-bold;
  background: hsl(28 95% 52%);
  color: white;
}

/* Sidebar historique */
.history-item {
  @apply flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all;
  border: 1px solid hsl(var(--border));
  margin-bottom: 6px;
}
.history-item:hover {
  background: hsl(var(--secondary));
  border-color: hsl(var(--primary) / 0.4);
}
.history-item.active {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.6);
}

/* Animation fade-in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in {
  animation: fadeIn 0.2s ease;
}

/* Barre de progression */
.progress-bar {
  height: 4px;
  border-radius: 2px;
  background: hsl(var(--muted));
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: hsl(var(--col-fait-bg-checked));
  transition: width 0.3s ease;
}
