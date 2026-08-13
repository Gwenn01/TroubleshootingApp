from django.db import transaction

from .models import Category, Subcategory, Problem


class JSONImportService:

    REQUIRED_FIELDS = [
        "id",
        "subcategory",
        "problem",
        "description",
    ]

    @classmethod
    @transaction.atomic
    def import_data(cls, data, category):

        if not isinstance(data, list):
            raise ValueError(
                "JSON must contain an array of problems."
            )

        created_count = 0
        updated_count = 0
        skipped_count = 0

        errors = []

        for index, item in enumerate(data):

            # ---------------------------------------
            # Make sure each item is an object
            # ---------------------------------------

            if not isinstance(item, dict):
                errors.append({
                    "index": index,
                    "error": "Problem must be a JSON object."
                })

                skipped_count += 1
                continue

            # ---------------------------------------
            # Check required fields
            # ---------------------------------------

            missing_fields = [
                field
                for field in cls.REQUIRED_FIELDS
                if not item.get(field)
            ]

            if missing_fields:
                errors.append({
                    "index": index,
                    "error": "Missing required fields.",
                    "fields": missing_fields,
                })

                skipped_count += 1
                continue

            problem_id = item["id"]

            subcategory_name = item["subcategory"]

            problem_name = item["problem"]

            # ---------------------------------------
            # Find/create subcategory
            # ---------------------------------------

            subcategory, _ = Subcategory.objects.get_or_create(
                category=category,
                name=subcategory_name
            )

            # ---------------------------------------
            # Problem data
            # ---------------------------------------

            problem_data = {
                "subcategory": subcategory,

                "problem": problem_name,

                "description": item.get(
                    "description",
                    ""
                ),

                "symptoms": item.get(
                    "symptoms",
                    []
                ),

                "possible_causes": item.get(
                    "possible_causes",
                    []
                ),

                "diagnostic_questions": item.get(
                    "diagnostic_questions",
                    []
                ),

                "commands": item.get(
                    "commands",
                    []
                ),

                "troubleshooting_steps": item.get(
                    "troubleshooting_steps",
                    []
                ),

                "possible_solutions": item.get(
                    "possible_solutions",
                    []
                ),

                "prevention": item.get(
                    "prevention",
                    []
                ),

                "keywords": item.get(
                    "keywords",
                    []
                ),

                "difficulty": item.get(
                    "difficulty",
                    ""
                ),

                "estimated_fix_time": item.get(
                    "estimated_fix_time",
                    ""
                ),

                "related_problems": item.get(
                    "related_problems",
                    []
                ),
            }

            # ---------------------------------------
            # Create or update problem
            # ---------------------------------------

            problem, created = Problem.objects.update_or_create(
                problem_id=problem_id,
                defaults=problem_data
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        return {
            "created": created_count,
            "updated": updated_count,
            "skipped": skipped_count,
            "errors": errors,
            "total": len(data),
        }