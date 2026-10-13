import * as categoryRepository from "../repositories/category.repository";
import { ApiError } from "../utils/ApiError";

export async function listCategories() {
  return categoryRepository.findAll();
}

export async function createCategory(input: {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}) {
  if (!input.slug || !input.name) {
    throw ApiError.badRequest("slug y name son obligatorios");
  }
  return categoryRepository.create(input);
}
