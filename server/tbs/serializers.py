from rest_framework import serializers
from .models import Category, Subcategory, Problem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class SubcategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Subcategory
        fields = ["id", "category", "category_name", "name"]


class ProblemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    category = serializers.CharField(source="subcategory.category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)

    class Meta:
        model = Problem
        fields = [
            "id",
            "problem_id",
            "problem",
            "category",
            "subcategory_name",
            "difficulty",
            "estimated_fix_time",
        ]


class ProblemSerializer(serializers.ModelSerializer):
    """Full serializer for detail views, create, and update."""
    category = serializers.CharField(source="subcategory.category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)

    class Meta:
        model = Problem
        fields = [
            "id",
            "problem_id",
            "subcategory",
            "category",
            "subcategory_name",
            "problem",
            "description",
            "symptoms",
            "possible_causes",
            "diagnostic_questions",
            "commands",
            "troubleshooting_steps",
            "possible_solutions",
            "prevention",
            "keywords",
            "difficulty",
            "estimated_fix_time",
            "related_problems",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]