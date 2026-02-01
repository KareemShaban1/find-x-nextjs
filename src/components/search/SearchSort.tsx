import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SortOption = "relevance" | "rating" | "distance" | "reviews";
export type ViewMode = "list" | "grid" | "map";

interface SearchSortProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  resultCount: number;
}

const SearchSort = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
}: SearchSortProps) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{resultCount}</span> results found
      </p>

      <div className="flex items-center gap-3">
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Most Relevant</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="distance">Nearest</SelectItem>
            <SelectItem value="reviews">Most Reviewed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-r-none ${viewMode === "list" ? "bg-muted" : ""}`}
            onClick={() => onViewModeChange("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none border-x border-border ${viewMode === "grid" ? "bg-muted" : ""}`}
            onClick={() => onViewModeChange("grid")}
            title="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-l-none ${viewMode === "map" ? "bg-muted" : ""}`}
            onClick={() => onViewModeChange("map")}
            title="Map view"
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchSort;
