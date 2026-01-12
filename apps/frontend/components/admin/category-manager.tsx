"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { frontendApi } from "@/lib/frontend-api";
import type { components } from "@/types/api";
import { FileJson, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

type Category = components["schemas"]["Category"];

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = React.useState(initialCategories);
  const [filter, setFilter] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [currentCategory, setCurrentCategory] =
    React.useState<Partial<Category> | null>(null);
  const [jsonInput, setJsonInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.slug.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory?.name || !currentCategory?.slug) return;

    setIsLoading(true);
    try {
      const payload = {
        name: currentCategory.name,
        slug: currentCategory.slug,
        description: currentCategory.description,
        icon: currentCategory.icon,
        priority: currentCategory.priority,
        isFeatured: currentCategory.isFeatured,
      };

      if (currentCategory.id) {
        const { data } = await frontendApi.admin.categories.update(
          currentCategory.id,
          payload
        );
        setCategories((prev) => prev.map((c) => (c.id === data.id ? data : c)));
        toast.success("Category updated");
      } else {
        const { data } = await frontendApi.admin.categories.create(
          payload
        );
        setCategories((prev) => [...prev, data]);
        toast.success("Category created");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setIsDeleting(true);
    try {
      await frontendApi.admin.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = async () => {
    if (!jsonInput.trim()) return;

    setIsLoading(true);
    try {
      const data = JSON.parse(jsonInput);
      const categoriesToImport = Array.isArray(data) ? data : [data];

      const createdCategories: Category[] = [];
      const errors: string[] = [];

      for (const cat of categoriesToImport) {
        try {
          const { data: newCat } = await frontendApi.admin.categories.create(
            cat
          );
          createdCategories.push(newCat);
        } catch (error) {
          errors.push(cat.name || "Unknown category");
        }
      }

      if (createdCategories.length > 0) {
        setCategories((prev) => [...prev, ...createdCategories]);
        toast.success(`Imported ${createdCategories.length} categories`);
      }

      if (errors.length > 0) {
        toast.error(`Failed to import: ${errors.join(", ")}`);
      }

      if (errors.length === 0) {
        setIsImportDialogOpen(false);
        setJsonInput("");
      }
    } catch (error) {
      toast.error("Invalid JSON format");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 rounded-xl bg-background/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            className="rounded-xl"
          >
            <FileJson className="mr-2 size-4" />
            Import JSON
          </Button>
          <Button
            onClick={() => {
              setCurrentCategory({
                name: "",
                slug: "",
                priority: 0,
                isFeatured: false,
              });
              setIsDialogOpen(true);
            }}
            className="rounded-xl"
          >
            <Plus className="mr-2 size-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="py-20 text-center">
              <Layers className="mx-auto size-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-heading font-semibold">
                No categories found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or add a new category.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-muted/20 border-border/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {category.icon ? (
                            <span className="text-lg">{category.icon}</span>
                          ) : (
                            <Layers className="size-4" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{category.name}</span>
                          {category.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg">
                        {category._count?.blocks || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{category.priority || 0}</TableCell>
                    <TableCell>
                      {category.isFeatured ? (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-lg">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Standard
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                          onClick={() => {
                            setCurrentCategory(category);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>
              {currentCategory?.id ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Categories help users find blocks in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={currentCategory?.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug =
                      currentCategory?.slug ||
                      name
                        .toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]/g, "");
                    setCurrentCategory((prev) => ({ ...prev, name, slug }));
                  }}
                  placeholder="e.g. Navigation"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={currentCategory?.slug || ""}
                  onChange={(e) =>
                    setCurrentCategory((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  placeholder="e.g. navigation"
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji or Lucide icon name)</Label>
              <Input
                id="icon"
                value={currentCategory?.icon || ""}
                onChange={(e) =>
                  setCurrentCategory((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                placeholder="e.g. 🧭"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentCategory?.description || ""}
                onChange={(e) =>
                  setCurrentCategory((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Short description of this category..."
                className="rounded-xl min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={currentCategory?.priority || 0}
                  onChange={(e) =>
                    setCurrentCategory((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value),
                    }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isFeatured"
                  checked={currentCategory?.isFeatured || false}
                  onCheckedChange={(checked) =>
                    setCurrentCategory((prev) => ({
                      ...prev,
                      isFeatured: checked,
                    }))
                  }
                />
                <Label htmlFor="isFeatured">Featured Category</Label>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl">
                {isLoading ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-160 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Import Categories</DialogTitle>
            <DialogDescription>
              Paste a JSON array of categories to import them in bulk.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="json-input">JSON Data</Label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "Buttons", "slug": "buttons", "icon": "🔘"}]'
                className="rounded-xl min-h-[300px] font-mono text-xs"
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-xl space-y-2">
              <p className="text-xs font-semibold">Example Format:</p>
              <pre className="text-[10px] text-muted-foreground overflow-auto">
                {`[
  {
    "name": "Navigation",
    "slug": "navigation",
    "description": "Menus, navbars, and links",
    "icon": "🧭",
    "priority": 10,
    "isFeatured": true
  }
]`}
              </pre>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImportDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading || !jsonInput.trim()}
                className="rounded-xl"
              >
                {isLoading ? "Importing..." : "Import Categories"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
