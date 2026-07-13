"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  clampRemovalItemQuantity,
  filterRemovalItemSuggestions,
  parseRemovalItemEntries,
  sanitizeRemovalItemLabel,
  serializeRemovalItemEntries,
  type RemovalItemEntry,
} from "@/lib/removal-item-suggestions";
import { cn } from "@/lib/utils";

type RemovalItemsTagInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function RemovalItemsTagInput({
  id,
  value,
  onChange,
  className,
  placeholder = "Type an item and press Enter",
}: RemovalItemsTagInputProps) {
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const entries = useMemo(() => parseRemovalItemEntries(value), [value]);
  const labels = useMemo(
    () => entries.map((entry) => entry.label),
    [entries],
  );

  const suggestions = useMemo(
    () => filterRemovalItemSuggestions(query, labels),
    [query, labels],
  );

  const showList = open && suggestions.length > 0 && query.trim().length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function commitEntries(next: RemovalItemEntry[]) {
    onChange(serializeRemovalItemEntries(next));
  }

  function clearQuery(refocus: boolean) {
    setQuery("");
    setOpen(false);
    setHighlight(0);
    if (refocus) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function addTag(raw: string, refocus = true) {
    const label = sanitizeRemovalItemLabel(raw);
    if (!label) return;

    const existingIndex = entries.findIndex(
      (entry) => entry.label.toLowerCase() === label.toLowerCase(),
    );

    if (existingIndex >= 0) {
      const next = entries.map((entry, index) =>
        index === existingIndex
          ? {
              ...entry,
              quantity: clampRemovalItemQuantity(entry.quantity + 1),
            }
          : entry,
      );
      commitEntries(next);
      clearQuery(refocus);
      return;
    }

    commitEntries([...entries, { label, quantity: 1 }]);
    clearQuery(refocus);
  }

  function removeEntry(index: number) {
    commitEntries(entries.filter((_, i) => i !== index));
  }

  function setQuantity(index: number, quantity: number) {
    commitEntries(
      entries.map((entry, i) =>
        i === index
          ? { ...entry, quantity: clampRemovalItemQuantity(quantity) }
          : entry,
      ),
    );
  }

  const activeOptionId = showList
    ? `${listboxId}-option-${highlight}`
    : undefined;

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={cn(
          "flex min-h-11 flex-col gap-2 rounded-xl border border-border bg-paper px-3 py-2 transition-colors duration-200 focus-within:border-primary",
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {entries.map((entry, index) => (
          <span
            key={`${entry.label}-${index}`}
            className="flex w-full min-w-0 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface py-1 pl-3 pr-1.5 text-sm text-ink"
          >
            <span className="min-w-0 flex-1 truncate">{entry.label}</span>
            <span
              className="inline-flex shrink-0 items-center rounded-full border border-border bg-paper"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label={`Decrease quantity of ${entry.label}`}
                disabled={entry.quantity <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-primary/10 hover:text-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
                onClick={() => setQuantity(index, entry.quantity - 1)}
              >
                <span aria-hidden>−</span>
              </button>
              <span
                className="min-w-6 text-center tabular-nums text-ink"
                aria-label={`${entry.quantity} of ${entry.label}`}
              >
                {entry.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${entry.label}`}
                disabled={entry.quantity >= 99}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-primary/10 hover:text-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
                onClick={() => setQuantity(index, entry.quantity + 1)}
              >
                <span aria-hidden>+</span>
              </button>
            </span>
            <button
              type="button"
              aria-label={`Remove ${entry.label}`}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-primary/10 hover:text-ink active:scale-[0.97]"
              onClick={(event) => {
                event.stopPropagation();
                removeEntry(index);
              }}
            >
              <span aria-hidden>×</span>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          placeholder={entries.length === 0 ? placeholder : "Add another…"}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          className="w-full border-0 bg-transparent px-1 py-1.5 text-sm text-ink outline-none placeholder:text-subtle"
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            if (query.trim()) {
              addTag(query, false);
            } else {
              setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Backspace" &&
              query.length === 0 &&
              entries.length
            ) {
              event.preventDefault();
              removeEntry(entries.length - 1);
              return;
            }

            if (showList) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlight((current) => (current + 1) % suggestions.length);
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlight(
                  (current) =>
                    (current - 1 + suggestions.length) % suggestions.length,
                );
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                return;
              }
            }

            if (event.key === "Enter") {
              event.preventDefault();
              if (showList && suggestions[highlight]) {
                addTag(suggestions[highlight]!);
              } else {
                addTag(query);
              }
            }
          }}
        />
      </div>

      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-xl border border-border bg-paper py-1 shadow-sm"
        >
          {suggestions.map((suggestion, index) => {
            const isActive = index === highlight;
            return (
              <li
                key={suggestion}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full px-4 py-2.5 text-left text-sm transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-ink"
                      : "text-ink hover:bg-surface",
                  )}
                  onMouseEnter={() => setHighlight(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    addTag(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
