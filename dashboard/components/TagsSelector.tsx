'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Tag {
  id: number;
  name: string;
}

interface TagsSelectorProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
}

export default function TagsSelector({ selectedTags, onTagsChange }: TagsSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagRows, setTagRows] = useState<Array<{ id: number | null; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await api.get('/admin/tags');
      const fetchedTags = response.data;
      setTags(fetchedTags);
      
      // Initialize rows with selected tags
      if (selectedTags.length > 0) {
        const selectedTagObjects = selectedTags
          .map(id => fetchedTags.find((t: Tag) => t.id === id))
          .filter(Boolean) as Tag[];
        if (selectedTagObjects.length > 0) {
          setTagRows(selectedTagObjects.map(tag => ({ id: tag.id, name: tag.name })));
        } else {
          // If no tags found, start with one empty row
          setTagRows([{ id: null, name: '' }]);
        }
      } else {
        // Start with one empty row if no selected tags
        setTagRows([{ id: null, name: '' }]);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      // Always ensure at least one row exists
      if (tagRows.length === 0) {
        setTagRows([{ id: null, name: '' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTags();
    }
  }, [mounted]);

  // Update rows when selectedTags prop changes (e.g., when editing existing business)
  useEffect(() => {
    if (!mounted || tags.length === 0) return;
    
    // Only initialize if we have selectedTags but no rows yet
    if (selectedTags.length > 0 && tagRows.length === 0) {
      const selectedTagObjects = selectedTags
        .map(id => tags.find(t => t.id === id))
        .filter(Boolean) as Tag[];
      if (selectedTagObjects.length > 0) {
        setTagRows(selectedTagObjects.map(tag => ({ id: tag.id, name: tag.name })));
      } else {
        setTagRows([{ id: null, name: '' }]);
      }
    } else if (selectedTags.length === 0 && tagRows.length === 0) {
      setTagRows([{ id: null, name: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, tags, mounted]);

  // Update selected tags when rows change
  useEffect(() => {
    const tagIds = tagRows
      .map(row => row.id)
      .filter((id): id is number => id !== null);
    onTagsChange(tagIds);
  }, [tagRows, onTagsChange]);

  const addRow = () => {
    setTagRows([...tagRows, { id: null, name: '' }]);
  };

  const removeRow = (index: number) => {
    if (tagRows.length > 1) {
      setTagRows(tagRows.filter((_, i) => i !== index));
    }
  };

  const handleTagSelect = async (index: number, tagId: number | null) => {
    const newRows = [...tagRows];
    const selectedTag = tags.find(t => t.id === tagId);
    newRows[index] = { id: tagId, name: selectedTag?.name || '' };
    setTagRows(newRows);
  };

  const handleCreateAndSelect = async (index: number, tagName: string) => {
    if (!tagName.trim()) return;
    try {
      const response = await api.post('/admin/tags', { name: tagName });
      const newTag = response.data;
      setTags([...tags, newTag]);
      
      const newRows = [...tagRows];
      newRows[index] = { id: newTag.id, name: newTag.name };
      setTagRows(newRows);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create tag');
    }
  };

  const handleTagNameChange = (index: number, name: string) => {
    const newRows = [...tagRows];
    newRows[index] = { ...newRows[index], name };
    setTagRows(newRows);
  };

  if (!mounted || loading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
      <div className="space-y-2">
        {tagRows.map((row, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              value={row.id || ''}
              onChange={(e) => {
                const tagId = e.target.value ? parseInt(e.target.value) : null;
                handleTagSelect(index, tagId);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              suppressHydrationWarning
              data-form-type="other"
            >
              <option value="">Select or create a tag...</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={row.name}
              onChange={(e) => handleTagNameChange(index, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && row.name.trim() && !row.id) {
                  e.preventDefault();
                  handleCreateAndSelect(index, row.name);
                }
              }}
              placeholder="Or type to create new tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              suppressHydrationWarning
              data-form-type="other"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={tagRows.length === 1}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Plus size={18} />
          Add Tag Row
        </button>
      </div>
    </div>
  );
}
