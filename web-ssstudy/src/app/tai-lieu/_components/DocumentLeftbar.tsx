"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { documentService } from "@/services/documentService";
import { DocumentCategory } from "@/types/document";

interface DocumentLeftbarProps {
  onClose?: () => void;
  basePath?: string; // Base path for navigation (e.g., '/tai-lieu' or '/tim-kiem')
}

/**
 * Component hiển thị sidebar bên trái của trang tài liệu
 */
export default function DocumentLeftbar({
  onClose,
  basePath = "/tai-lieu",
}: DocumentLeftbarProps) {
  // State để quản lý trạng thái đóng/mở của từng danh mục
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current URL parameters
  const currentCategoryId = searchParams?.get("category_id") || "";
  const currentGroupId = searchParams?.get("group_id") || "";

  // Auto-expand the active section when URL changes or categories load
  useEffect(() => {
    if (categories.length > 0) {
      if (currentGroupId) {
        setOpenSections({ [currentGroupId]: true });
      } else if (currentCategoryId) {
        // Find parent of current category
        const parent = categories.find(cat => 
          cat.sub_categories?.some(sub => sub._id === currentCategoryId)
        );
        if (parent) {
          setOpenSections({ [parent._id]: true });
        }
      }
    }
  }, [categories, currentCategoryId, currentGroupId]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await documentService.getDocumentCategoryList({
          page: "1",
          limit: "100",
          keyword: ""
        });
        
        // Handle both format { code, data: { records } } and raw data
        const root = (response as any)?.data ?? response;
        const records = root?.records || response?.data?.records || [];
        
        if (records.length > 0) {
          setCategories(records);
        } else if (Array.isArray(response)) {
          setCategories(response);
        } else if (Array.isArray(root)) {
          setCategories(root);
        }
      } catch (error) {
        console.error("Failed to fetch document categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hàm toggle trạng thái đóng/mở - chỉ mở 1 section tại 1 thời điểm
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev: Record<string, boolean>) => {
      const isCurrentlyOpen = prev[sectionId];
      if (isCurrentlyOpen) {
        return {};
      } else {
        return { [sectionId]: true };
      }
    });
  };

  // Hàm xử lý click vào danh mục (cha hoặc con)
  const handleCategoryClick = (categoryId: string | undefined, isParent: boolean, parentId?: string) => {
    // Skip if no valid id
    if (!categoryId) return;
    
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (isParent) {
      params.set("group_id", categoryId);
      params.delete("category_id");
    } else {
      params.set("category_id", categoryId);
      // Tự động set group_id của danh mục cha khi chọn danh mục con
      if (parentId) {
        params.set("group_id", parentId);
      }
    }

    params.delete("page");
    params.delete("subject_id"); // Clear old param

    let finalUrl = `${basePath}?${params.toString()}`;

    if (basePath === "/tim-kiem" && !params.get("type")) {
      params.set("type", "DOCUMENT");
      finalUrl = `${basePath}?${params.toString()}`;
    }

    router.push(finalUrl);

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      {/* Header với nút đóng cho mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Lọc tài liệu</h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Đóng menu lọc"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {!loading ? (
            categories.map((category) => (
              <div key={category._id} className="border-b pb-2">
                <div className="flex items-center">
                  <button
                    className={`flex-1 text-left py-2 px-3 rounded-md transition-colors ${
                      currentGroupId === category._id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleCategoryClick(category._id, true)}
                  >
                    <span className="font-medium">{category.name}</span>
                  </button>
                  
                  {category.sub_categories && category.sub_categories.length > 0 && (
                    <button
                      className={`p-2 rounded-md transition-colors ${
                        openSections[category._id]
                          ? "text-blue-600"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(category._id);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform ${
                          openSections[category._id] ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {openSections[category._id] && category.sub_categories && (
                  <div className="pl-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {category.sub_categories.map((sub, subIndex) => {
                      const subId = (sub as any).id || sub._id;
                      const isActive = subId === currentCategoryId;
                      return (
                        <div
                          key={subId || `sub-${subIndex}`}
                          onClick={() => handleCategoryClick(subId, false, category._id)}
                          className={`py-1.5 text-left text-sm cursor-pointer rounded px-2 transition-colors ${
                            isActive
                              ? "bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-600"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {sub.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
