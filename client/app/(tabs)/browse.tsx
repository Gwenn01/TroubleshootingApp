import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
import {
  Breadcrumb,
  type Crumb,
} from "../../components/tabs/browse/Breadcrumb";
import { BrowseSearchBar } from "../../components/tabs/browse/Browsesearchbar";
import { CategoryCard } from "../../components/tabs/browse/Categorycard";
import { SubcategoryCard } from "../../components/tabs/browse/Subcategorycard";
import { ProblemCard } from "../../components/tabs/browse/Problemcard";
import { ProblemSection } from "../../components/tabs/browse/Problemsection";
import { TroubleshootingStepItem } from "../../components/tabs/browse/Troubleshootingstepitem";
import { EmptyState } from "../../components/tabs/browse/Emptystate";

// Same bundled dataset the chat/search feature uses — Browse never
// loads or defines its own copy of the data.
import datasetRecords from "../../assets/dataset.json";

type BrowseLevel = "home" | "category" | "subcategory" | "detail";

export default function BrowseScreen() {
  const records = datasetRecords as TroubleshootingRecord[];
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

  // ------------------------------------------------------------------
  // DETAIL — Problem Details screen
  // ------------------------------------------------------------------
  if (level === "detail" && selectedRecord) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="border-b border-slate-100 bg-white px-5 pb-3 pt-14">
          <Breadcrumb items={breadcrumbItems} />
          <Text className="mt-1 text-xl font-bold text-slate-900">
            {selectedRecord.problem}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <ProblemSection
            title="Description"
            bodyText={selectedRecord.description}
          />
          <ProblemSection title="Symptoms" items={selectedRecord.symptoms} />
          <ProblemSection
            title="Possible causes"
            items={selectedRecord.possibleCauses}
          />

          {selectedRecord.troubleshootingSteps.length > 0 && (
            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Troubleshooting steps
              </Text>
              {selectedRecord.troubleshootingSteps.map((step, index) => (
                <TroubleshootingStepItem
                  key={index}
                  step={step}
                  index={index}
                />
              ))}
            </View>
          )}

          <ProblemSection
            title="Solution"
            items={selectedRecord.possibleSolutions}
          />
          <ProblemSection
            title="Prevention"
            items={selectedRecord.prevention}
          />
          <ProblemSection
            title="Related problems"
            items={selectedRecord.relatedProblems}
          />
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // SUBCATEGORY — Problem List screen
  // ------------------------------------------------------------------
  if (level === "subcategory" && selectedCategory && selectedSubcategory) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="border-b border-slate-100 bg-white px-5 pb-3 pt-14">
          <Breadcrumb items={breadcrumbItems} />
          <Text className="mt-1 text-xl font-bold text-slate-900">
            {displayCategoryName(selectedSubcategory)}
          </Text>
          <View className="mt-3">
            <BrowseSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Filter guides"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {problems.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No problems found in this category."
              description={query ? "Try a different search term." : undefined}
            />
          ) : (
            problems.map((record) => (
              <ProblemCard
                key={record.id}
                record={record}
                onPress={() => openProblem(record.id)}
              />
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // CATEGORY — Subcategories screen
  // ------------------------------------------------------------------
  if (level === "category" && selectedCategory) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="border-b border-slate-100 bg-white px-5 pb-3 pt-14">
          <Breadcrumb items={breadcrumbItems} />
          <Text className="mt-1 text-xl font-bold text-slate-900">
            {displayCategoryName(selectedCategory)}
          </Text>
          <View className="mt-3">
            <BrowseSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Filter subcategories"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {subcategories.length === 0 ? (
            <EmptyState
              icon="folder-open-outline"
              title="No troubleshooting guides available."
              description={query ? "Try a different search term." : undefined}
            />
          ) : (
            subcategories.map((sub) => (
              <SubcategoryCard
                key={sub.name}
                subcategory={sub.name}
                guideCount={sub.guideCount}
                onPress={() => openSubcategory(sub.name)}
              />
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // HOME — Browse landing screen
  // ------------------------------------------------------------------
  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14">
        <Text className="text-2xl font-bold text-slate-900">Browse</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Explore troubleshooting guides by category.
        </Text>
        <View className="mt-3">
          <BrowseSearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search categories"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No results found."
            description="Try a different search term."
          />
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category.name}
              guideCount={category.guideCount}
              onPress={() => openCategory(category.name)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
