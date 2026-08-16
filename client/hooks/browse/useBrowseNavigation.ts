import { useMemo, useState } from "react";
import type { TroubleshootingRecord } from "../../services/general/DatasetLoader";
import {
  buildBrowseCatalog,
  filterCategories,
  filterProblems,
  filterSubcategories,
  listCategories,
  listProblems,
  listSubcategories,
} from "../../services/browse/Browsecatalog";
import { displayCategoryName } from "../../utils/browse/Categorymeta";
import type { Crumb } from "../../components/tabs/browse/Breadcrumb";

export type BrowseLevel = "home" | "category" | "subcategory" | "detail";

export function useBrowseNavigation(records: TroubleshootingRecord[]) {
  const catalog = useMemo(() => buildBrowseCatalog(records), [records]);

  const [level, setLevel] = useState<BrowseLevel>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => filterCategories(listCategories(catalog), query),
    [catalog, query],
  );

  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return filterSubcategories(
      listSubcategories(catalog, selectedCategory),
      query,
    );
  }, [catalog, selectedCategory, query]);

  const problems = useMemo(() => {
    if (!selectedCategory || !selectedSubcategory) return [];
    return filterProblems(
      listProblems(catalog, selectedCategory, selectedSubcategory),
      query,
    );
  }, [catalog, selectedCategory, selectedSubcategory, query]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  const openCategory = (category: string) => {
    setSelectedCategory(category);
    setQuery("");
    setLevel("category");
  };

  const openSubcategory = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setQuery("");
    setLevel("subcategory");
  };

  const openProblem = (recordId: string) => {
    setSelectedRecordId(recordId);
    setLevel("detail");
  };

  const goHome = () => {
    setLevel("home");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedRecordId(null);
    setQuery("");
  };

  const goToCategory = () => {
    setLevel("category");
    setSelectedSubcategory(null);
    setSelectedRecordId(null);
    setQuery("");
  };

  const goToSubcategory = () => {
    setLevel("subcategory");
    setSelectedRecordId(null);
  };

  const breadcrumbItems = useMemo<Crumb[]>(() => {
    const items: Crumb[] = [
      { label: "Browse", onPress: level !== "home" ? goHome : undefined },
    ];

    if (selectedCategory && level !== "home") {
      items.push({
        label: displayCategoryName(selectedCategory),
        onPress: level !== "category" ? goToCategory : undefined,
      });
    }

    if (
      selectedSubcategory &&
      (level === "subcategory" || level === "detail")
    ) {
      items.push({
        label: displayCategoryName(selectedSubcategory),
        onPress: level !== "subcategory" ? goToSubcategory : undefined,
      });
    }

    return items;
  }, [level, selectedCategory, selectedSubcategory]);

  return {
    level,
    query,
    setQuery,
    selectedCategory,
    selectedSubcategory,
    selectedRecord,
    categories,
    subcategories,
    problems,
    breadcrumbItems,
    openCategory,
    openSubcategory,
    openProblem,
  };
}
