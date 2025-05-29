const supabase = require('../config/supabase');
const { formatResponse } = require('../utils/helpers');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error fetching categories', 500)
      );
    }

    res.json(formatResponse(true, { categories }, 'Categories fetched successfully'));
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error fetching categories', 500)
    );
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !category) {
      return res.status(404).json(
        formatResponse(false, null, 'Category not found', 404)
      );
    }

    res.json(formatResponse(true, { category }, 'Category fetched successfully'));
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error fetching category', 500)
    );
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json(
      formatResponse(false, null, 'Please provide category name', 400)
    );
  }

  try {
    // Check if category already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('name', name)
      .single();

    if (existingCategory) {
      return res.status(400).json(
        formatResponse(false, null, 'Category with this name already exists', 400)
      );
    }

    // Create new category
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select();

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error creating category', 500)
      );
    }

    res.status(201).json(
      formatResponse(true, { category: newCategory[0] }, 'Category created successfully', 201)
    );
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error creating category', 500)
    );
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json(
      formatResponse(false, null, 'Please provide category name', 400)
    );
  }

  try {
    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return res.status(404).json(
        formatResponse(false, null, 'Category not found', 404)
      );
    }

    // Update category
    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error updating category', 500)
      );
    }

    res.json(
      formatResponse(true, { category: updatedCategory }, 'Category updated successfully')
    );
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error updating category', 500)
    );
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return res.status(404).json(
        formatResponse(false, null, 'Category not found', 404)
      );
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error deleting category', 500)
      );
    }

    res.json(
      formatResponse(true, null, 'Category deleted successfully')
    );
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error deleting category', 500)
    );
  }
}; 