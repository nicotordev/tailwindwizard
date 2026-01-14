import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VisibilityToggle } from "@/components/primitives/visibility-toggle";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Info } from "lucide-react";
import * as React from "react";
import {
  FiCpu,
  FiFileText,
  FiGrid,
  FiLayers,
  FiLink,
  FiWind,
  FiTriangle,
} from "react-icons/fi";
import StackIcon from "tech-stack-icons";
import { BlockDraft, frameworkOptions, stylingOptions } from "../types";
import type { components } from "@/types/api";

interface MetadataStepProps {
  draft: BlockDraft;
  setField: <K extends keyof BlockDraft>(key: K, value: BlockDraft[K]) => void;
  updateTitle: (value: string) => void;
  slugTouched: boolean;
  setSlugTouched: (value: boolean) => void;
  categories: components["schemas"]["Category"][] | undefined;
  categoriesLoading: boolean;
  tags: components["schemas"]["Tag"][] | undefined;
  tagsLoading: boolean;
  setDraft: React.Dispatch<React.SetStateAction<BlockDraft>>;
}

export function MetadataStep({
  draft,
  setField,
  updateTitle,
  slugTouched,
  setSlugTouched,
  categories,
  categoriesLoading,
  tags,
  tagsLoading,
  setDraft,
}: MetadataStepProps) {
  const currentFramework = frameworkOptions[draft.framework];
  const currentStyling = stylingOptions[draft.stylingEngine];
  const FrameworkIcon = currentFramework.icon;
  const StylingIcon = currentStyling.icon;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Title
          </label>
          <Input
            value={draft.title}
            onChange={(event) => updateTitle(event.target.value)}
            placeholder="e.g. Neo-Glass Dashboard Sidebar"
            className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Slug
          </label>
          <div className="space-y-3">
            <Input
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setField("slug", event.target.value);
              }}
              placeholder="neo-glass-sidebar"
              className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all font-mono text-sm px-5"
            />
            <div className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground bg-muted/30 w-fit py-1.5 px-3 rounded-lg">
              <FiLink className="size-3 text-primary" />
              tailwindwizard.com/blocks/{draft.slug || "..."}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold tracking-tight text-foreground/80">
          Description
        </label>
        <Textarea
          value={draft.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder="Describe the magical properties of your component..."
          className="min-h-[160px] rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base p-5 leading-relaxed"
        />
      </div>

      <div className="flex items-stretch gap-8">
        <div className="space-y-3 flex-1">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Tags
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={tagsLoading}
                className="h-14 w-full justify-between rounded-2xl bg-background/40 border-border/60 hover:bg-background/60 px-5 text-base font-normal"
              >
                {draft.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 overflow-hidden">
                    {draft.tags.map((tagId) => {
                      const tag = tags?.find((t) => t.id === tagId);
                      return (
                        <Badge
                          key={tagId}
                          variant="secondary"
                          className="rounded-md px-1.5 py-0.5 text-xs font-medium"
                        >
                          {tag?.name || tagId}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select tags...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tag found.</CommandEmpty>
                  <CommandGroup>
                    {tags?.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => {
                          setDraft((prev) => {
                            const isActive = prev.tags.includes(tag.id);
                            return {
                              ...prev,
                              tags: isActive
                                ? prev.tags.filter((t) => t !== tag.id)
                                : [...prev.tags, tag.id],
                            };
                          });
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            draft.tags.includes(tag.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-stretch gap-8">
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Category
          </label>
          <Select
            value={draft.categoryId}
            onValueChange={(value) => setField("categoryId", value)}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
              <SelectValue
                placeholder={
                  categoriesLoading
                    ? "Summoning categories..."
                    : "Select the best fit"
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
              {(categories || []).map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="rounded-xl my-1 mx-1 focus:bg-primary/10"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Type
          </label>
          <Select
            value={draft.type}
            onValueChange={(value) =>
              setField("type", value as BlockDraft["type"])
            }
          >
            <SelectTrigger className="rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40">
              <SelectItem value="COMPONENT" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <FiGrid className="size-4 text-primary" />
                  Component
                </div>
              </SelectItem>
              <SelectItem value="SECTION" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <FiLayers className="size-4 text-primary" />
                  Section
                </div>
              </SelectItem>
              <SelectItem value="PAGE" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <FiFileText className="size-4 text-primary" />
                  Page
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Framework
          </label>
          <Select
            value={draft.framework}
            onValueChange={(value) =>
              setField("framework", value as BlockDraft["framework"])
            }
          >
            <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40">
              <SelectItem value="REACT" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <StackIcon name="react" className="h-5 w-5" />
                  React
                </div>
              </SelectItem>
              <SelectItem value="VUE" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <StackIcon name="vuejs" className="h-5 w-5" />
                  Vue
                </div>
              </SelectItem>
              <SelectItem value="SVELTE" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <FiTriangle className="size-4 text-primary" />
                  Svelte
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">
            Styling
          </label>
          <Select
            value={draft.stylingEngine}
            onValueChange={(value) =>
              setField("stylingEngine", value as BlockDraft["stylingEngine"])
            }
          >
            <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40">
              <SelectItem value="TAILWIND" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <StackIcon name="tailwindcss" className="h-5 w-5" />
                  Tailwind
                </div>
              </SelectItem>
              <SelectItem value="CSS" className="rounded-xl my-1 mx-1">
                <div className="flex items-center gap-3">
                  <StackIcon name="css3" className="h-5 w-5" />
                  CSS
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold tracking-tight text-foreground/80">
          Visibility
        </label>
        <div className="flex flex-wrap items-center gap-6 p-6 rounded-3xl bg-primary/5 border border-primary/10">
          <VisibilityToggle
            value={draft.visibility}
            onChange={(value) => setField("visibility", value)}
            className="rounded-xl shadow-sm"
          />
          <p className="text-sm font-medium text-muted-foreground/80 max-w-sm leading-relaxed">
            Control who can witness this creation while it remains in draft or
            review status.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/40 bg-muted/20 p-8 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          Manifestation Preview
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge
            variant="secondary"
            className="rounded-full px-5 py-2 bg-background border border-border/60 shadow-sm text-xs font-bold flex items-center gap-2"
          >
            {draft.type === "COMPONENT" && (
              <FiGrid
                className="size-3.5 text-primary"
                aria-label="Component type"
              />
            )}
            {draft.type === "SECTION" && (
              <FiLayers
                className="size-3.5 text-primary"
                aria-label="Section type"
              />
            )}
            {draft.type === "PAGE" && (
              <FiFileText
                className="size-3.5 text-primary"
                aria-label="Page type"
              />
            )}
            {draft.type.toLowerCase()}
          </Badge>
          <Badge
            variant="secondary"
            className="rounded-full px-5 py-2 bg-background border border-border/60 shadow-sm text-xs font-bold flex items-center gap-2"
          >
            {currentFramework.stack ? (
              <StackIcon
                name={currentFramework.stack}
                className="size-3.5"
                aria-label={`${currentFramework.label} framework`}
              />
            ) : FrameworkIcon ? (
              <FrameworkIcon
                className="size-3.5 text-primary"
                aria-label={`${currentFramework.label} framework`}
              />
            ) : (
              <FiCpu className="size-3.5 text-primary" aria-label="Framework" />
            )}
            {currentFramework.label}
          </Badge>
          <Badge
            variant="secondary"
            className="rounded-full px-5 py-2 bg-background border border-border/60 shadow-sm text-xs font-bold flex items-center gap-2"
          >
            {currentStyling.stack ? (
              <StackIcon
                name={currentStyling.stack}
                className="size-3.5"
                aria-label={`${currentStyling.label} styling engine`}
              />
            ) : StylingIcon ? (
              <StylingIcon
                className="size-3.5 text-primary"
                aria-label={`${currentStyling.label} styling engine`}
              />
            ) : (
              <FiWind
                className="size-3.5 text-primary"
                aria-label="Styling engine"
              />
            )}
            {currentStyling.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
