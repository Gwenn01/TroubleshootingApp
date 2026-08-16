import { Text, View } from "react-native";
import type { TroubleshootingRecord } from "../../services/general/DatasetLoader";
import { displayCategoryName } from "../../utils/browse/Categorymeta";
import { useBrowseNavigation } from "../../hooks/browse/useBrowseNavigation";
import { BrowseHeader } from "../../components/tabs/browse/Browseheader";
import { BrowseScrollView } from "../../components/tabs/browse/BrowseScrollView";
import { CategoryCard } from "../../components/tabs/browse/Categorycard";
import { SubcategoryCard } from "../../components/tabs/browse/Subcategorycard";
import { ProblemCard } from "../../components/tabs/browse/Problemcard";
import { ProblemSection } from "../../components/tabs/browse/Problemsection";
import { TroubleshootingStepItem } from "../../components/tabs/browse/Troubleshootingstepitem";
import { EmptyState } from "../../components/tabs/browse/Emptystate";

// Same bundled dataset the chat/search feature uses — Browse never
// loads or defines its own copy of the data.
import datasetRecords from "../../assets/dataset.json";

export default function BrowseScreen() {
  const records = datasetRecords as TroubleshootingRecord[];
  const {
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
  } = useBrowseNavigation(records);

  // ------------------------------------------------------------------
  // DETAIL — Problem Details screen
  // ------------------------------------------------------------------
  if (level === "detail" && selectedRecord) {
    return (
      <View className="flex-1 bg-slate-50">
        <BrowseHeader
          breadcrumbItems={breadcrumbItems}
          title={selectedRecord.problem}
        />

        <BrowseScrollView>
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
        </BrowseScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // SUBCATEGORY — Problem List screen
  // ------------------------------------------------------------------
  if (level === "subcategory" && selectedCategory && selectedSubcategory) {
    return (
      <View className="flex-1 bg-slate-50">
        <BrowseHeader
          breadcrumbItems={breadcrumbItems}
          title={displayCategoryName(selectedSubcategory)}
          search={{
            value: query,
            onChangeText: setQuery,
            placeholder: "Filter guides",
          }}
        />

        <BrowseScrollView>
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
        </BrowseScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // CATEGORY — Subcategories screen
  // ------------------------------------------------------------------
  if (level === "category" && selectedCategory) {
    return (
      <View className="flex-1 bg-slate-50">
        <BrowseHeader
          breadcrumbItems={breadcrumbItems}
          title={displayCategoryName(selectedCategory)}
          search={{
            value: query,
            onChangeText: setQuery,
            placeholder: "Filter subcategories",
          }}
        />

        <BrowseScrollView>
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
        </BrowseScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // HOME — Browse landing screen
  // ------------------------------------------------------------------
  return (
    <View className="flex-1 bg-slate-50">
      <BrowseHeader
        breadcrumbItems={breadcrumbItems}
        title="Browse"
        subtitle="Explore troubleshooting guides by category."
        search={{
          value: query,
          onChangeText: setQuery,
          placeholder: "Search categories",
        }}
      />

      <BrowseScrollView>
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
      </BrowseScrollView>
    </View>
  );
}
