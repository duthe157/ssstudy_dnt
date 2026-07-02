import React, { useState, useEffect, useRef } from "react";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// Import resize module
import ImageResize from 'quill-image-resize-module-react';
import { baseURL } from "../../config/config";
import { notification } from "antd";

// Register resize module
Quill.register('modules/imageResize', ImageResize);

const AdminCeo = () => {
  const [ceoAvatar, setCeoAvatar] = useState("");
  const [ceoName, setCeoName] = useState("");
  const [ceoDescription, setCeoDescription] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ceoId, setCeoId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasRefreshedContent, setHasRefreshedContent] = useState(false);
  const quillRef = useRef(null);

  // Custom toolbar with Vietnamese labels
  const toolbarOptions = [
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ];

  // Fetch CEO data from API
  useEffect(() => {
    fetchCeoData();
  }, []);

  // Handle editor changes
  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  // Force refresh editor when content changes from DB (only once)
  useEffect(() => {
    if (editorContent && quillRef.current && !hasRefreshedContent && !loading) {
      const timer = setTimeout(() => {
        console.log('Applying one-time content refresh for images from DB');
        const quill = quillRef.current.getEditor();
        if (quill) {
          // Ensure images display with correct sizes from DB
          const editor = quill.root;
          const images = editor.querySelectorAll('img');
          
          images.forEach((img, index) => {
            if (img.style.width || img.style.height) {
              console.log(`Image ${index + 1} from DB:`, {
                width: img.style.width,
                height: img.style.height
              });
              // Ensure image is properly displayed
              img.style.display = 'inline-block';
              img.style.maxWidth = '100%';
            }
          });
          
          setHasRefreshedContent(true); // Mark as refreshed
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [editorContent, hasRefreshedContent, loading]);

  // Monitor image changes after mount (tooltips only)
  useEffect(() => {
    const interval = setInterval(() => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        clearInterval(interval);
        
        const tooltips = {
          '.ql-bold': 'Đậm (Ctrl+B)',
          '.ql-italic': 'Nghiêng (Ctrl+I)', 
          '.ql-underline': 'Gạch chân (Ctrl+U)',
          '.ql-strike': 'Gạch ngang',
          '.ql-blockquote': 'Trích dẫn',
          '.ql-code-block': 'Khối mã',
          '.ql-list[value="ordered"]': 'Danh sách có số',
          '.ql-list[value="bullet"]': 'Danh sách dấu chấm',
          '.ql-link': 'Chèn liên kết',
          '.ql-image': 'Chèn hình ảnh',
          '.ql-video': 'Chèn video',
          '.ql-clean': 'Xóa định dạng',
          '.ql-align .ql-picker-label': 'Căn chỉnh',
          '.ql-color .ql-picker-label': 'Màu chữ',
          '.ql-background .ql-picker-label': 'Màu nền',
          '.ql-size .ql-picker-label': 'Kích thước',
          '.ql-header .ql-picker-label': 'Tiêu đề',
          '.ql-script[value="sub"]': 'Chỉ số dưới',
          '.ql-script[value="super"]': 'Chỉ số trên',
          '.ql-indent[value="-1"]': 'Giảm thụt lề',
          '.ql-indent[value="+1"]': 'Tăng thụt lề'
        };
        
        Object.entries(tooltips).forEach(([selector, tooltip]) => {
          const elements = toolbar.querySelectorAll(selector);
          elements.forEach(el => {
            el.setAttribute('title', tooltip);
            el.setAttribute('aria-label', tooltip);
          });
        });
      }
    }, 100);
  }, []);

  // Ensure images render correctly after editor is ready
  useEffect(() => {
    if (!loading && editorContent && quillRef.current && !hasRefreshedContent) {
      const timer = setTimeout(() => {
        const editor = document.querySelector('.ql-editor');
        if (editor) {
          const images = editor.querySelectorAll('img');
          if (images.length > 0) {
            console.log(`Found ${images.length} images from DB - ready for resize`);
          }
        }
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [loading, editorContent, hasRefreshedContent]);

  // Auto-resize editor based on content
  useEffect(() => {
    if (quillRef.current) {
      const timer = setTimeout(() => {
        const quill = quillRef.current.getEditor();
        const container = document.querySelector('.ql-container');
        const editor = document.querySelector('.ql-editor');
        
        if (quill && container && editor) {
          // Listen for text changes to adjust height
          quill.on('text-change', () => {
            const contentHeight = editor.scrollHeight;
            const minHeight = 400;
            const newHeight = Math.max(minHeight, contentHeight + 50); // Add padding
            
            container.style.height = newHeight + 'px';
            editor.style.height = (newHeight - 42) + 'px'; // Subtract toolbar height
          });
          
          // Initial height adjustment
          const contentHeight = editor.scrollHeight;
          const minHeight = 400;
          const newHeight = Math.max(minHeight, contentHeight + 50);
          
          container.style.height = newHeight + 'px';
          editor.style.height = (newHeight - 42) + 'px';
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [editorContent]);

  const fetchCeoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/ceo-page/detail`, {
        method: "POST",
        headers: {
          Authorization: `${localStorage.getItem("SSID") || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CEO data");
      }

      const result = await response.json();

      if (result.code === 200 && result.data) {
        const data = result.data;
        setCeoId(data._id);
        setCeoName(data.name || "");
        setCeoAvatar(data.avatar || "");
        setCeoDescription(data.ceo_description || "");
        
        // Set editor content
        const description = data.description || "";
        console.log('Loading content from DB:', description.length, 'characters');
        setEditorContent(description);
        setAchievements(data.achievements || []);
        
        // Reset refresh flag for new content
        setHasRefreshedContent(false);
      }
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Lỗi khi tải dữ liệu CEO. Vui lòng thử lại.",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = () => {
    setAchievements([
      ...achievements,
      { id: Date.now(), icon: "", description: "" },
    ]);
  };

  const handleRemoveAchievement = (id) => {
    setAchievements(achievements.filter((item) => item.id !== id));
  };

  // Auto resize textarea - Tối ưu nhất
  const handleTextareaChange = (e, id) => {
    e.target.style.height = "auto";

    // Đảm bảo height tối thiểu là 50px
    const newHeight = Math.max(50, e.target.scrollHeight);
    e.target.style.height = newHeight + "px";

    setAchievements(
      achievements.map((item) =>
        item.id === id ? { ...item, description: e.target.value } : item
      )
    );
  };

  // Xử lý upload ảnh đại diện
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file
      if (file.size > 5 * 1024 * 1024) {
        notification.error({
          message: "File quá lớn",
          description: "Kích thước file không được vượt quá 5MB",
          placement: "topRight",
          duration: 5,
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Kiểm tra định dạng file
      const validFormats = [
        "image/png",
        "image/svg+xml",
        "image/jpeg",
        "image/jpg",
        "image/gif",
      ];
      if (!validFormats.includes(file.type)) {
        notification.error({
          message: "Định dạng không hợp lệ",
          description: "Vui lòng chọn file PNG, SVG, JPG hoặc GIF",
          placement: "topRight",
          duration: 5,
        });
        e.target.value = ""; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCeoAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý upload icon thành tích với validation đầy đủ
  const handleIconUpload = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notification.error({
        message: "File quá lớn",
        description: "Kích thước file không được vượt quá 5MB",
        placement: "topRight",
        duration: 5,
      });
      e.target.value = ""; // Reset input
      return;
    }

    // 2. Kiểm tra định dạng file
    const validFormats = [
      "image/png",
      "image/svg+xml",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];
    if (!validFormats.includes(file.type)) {
      notification.error({
        message: "Định dạng không hợp lệ",
        description: "Vui lòng chọn file PNG, SVG, JPG hoặc GIF",
        placement: "topRight",
        duration: 5,
      });
      e.target.value = ""; // Reset input
      return;
    }

    // 3. Kiểm tra kích thước ảnh (50x50 pixel)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Kiểm tra kích thước pixel
        if (img.width !== 50 || img.height !== 50) {
          const confirmUpload = window.confirm(
            `Kích thước icon hiện tại là ${img.width}×${img.height} pixel.\n` +
            `Kích thước tiêu chuẩn là 50×50 pixel.\n\n` +
            `Bạn có muốn tiếp tục upload không?`
          );

          if (!confirmUpload) {
            e.target.value = ""; // Reset input
            return;
          }
        }

        // Nếu pass tất cả validation hoặc user confirm, thì lưu icon
        setAchievements(
          achievements.map((item) =>
            item.id === id ? { ...item, icon: event.target.result } : item
          )
        );
      };

      img.onerror = () => {
        notification.error({
          message: "Lỗi đọc file",
          description: "Không thể đọc file ảnh. Vui lòng chọn file khác.",
          placement: "topRight",
          duration: 5,
        });
        e.target.value = ""; // Reset input
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      notification.error({
        message: "Lỗi đọc file",
        description: "Có lỗi xảy ra khi đọc file. Vui lòng thử lại.",
        placement: "topRight",
        duration: 5,
      });
      e.target.value = ""; // Reset input
    };

    reader.readAsDataURL(file);
  };

  // Validation
  const validateForm = () => {
    return true;
  };

  // Xử lý lưu
  const handleSave = async () => {
    if (!validateForm()) return;

    // Sync content từ editor trước khi save
    const editor = document.querySelector('.ql-editor');
    const currentContent = editor ? editor.innerHTML : editorContent;
    
    // Cập nhật state nếu content khác
    if (currentContent !== editorContent) {
      setEditorContent(currentContent);
    }

    try {
      setIsSaving(true);

      const data = {
        name: ceoName,
        avatar: ceoAvatar,
        ceo_description: ceoDescription,
        achievements: achievements,
        description: currentContent,
      };

      const response = await fetch(`${baseURL}/ceo-page/update`, {
        method: "POST",
        headers: {
          Authorization: `${localStorage.getItem("SSID") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save CEO data");
      }

      const result = await response.json();

      if (result.code === 200) {
        notification.success({
          message: "Lưu thành công",
          description: "Dữ liệu CEO đã được lưu thành công",
          placement: "topRight",
          duration: 5,
        });
      } else {
        notification.error({
          message: "Lỗi lưu dữ liệu",
          description: result.message || "Có lỗi xảy ra. Vui lòng thử lại.",
          placement: "topRight",
          duration: 5,
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi lưu dữ liệu",
        description: "Lỗi khi lưu dữ liệu. Vui lòng thử lại.",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý hủy
  const handleCancel = async () => {
    if (window.confirm("Bạn có chắc muốn hủy các thay đổi?")) {
      setHasRefreshedContent(false); // Reset refresh flag
      await fetchCeoData(); // Fetch lại data thay vì reload trang
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "15  00px", margin: "0 auto" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <section style={{ background: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#333" }}>Thông tin CEO</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
              {/* Cột form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: "500", color: "#333" }}>
                  Tên CEO
                  <input
                    type="text"
                    placeholder="Nhập tên CEO"
                    value={ceoName}
                    onChange={(e) => setCeoName(e.target.value)}
                    style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: "500", color: "#333" }}>
                  Mô tả
                  <textarea
                    placeholder="Nhập mô tả ngắn gọn về CEO"
                    value={ceoDescription}
                    onChange={(e) => setCeoDescription(e.target.value)}
                    style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s", minHeight: "100px", resize: "vertical" }}
                  />
                </label>
              </div>

              {/* Cột ảnh */}
              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#333", marginBottom: "8px", display: "block" }}>
                  Ảnh đại diện
                </label>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", border: "2px dashed #d9d9d9", padding: "20px 0 0 0", borderRadius: "4px" }}>
                  <div style={{ width: "100%", maxWidth: "200px", position: "relative", borderRadius: "8px", overflow: "hidden", border: "2px solid #eee" }}>
                    <img
                      src={
                        ceoAvatar 
                      }
                      alt="Ảnh đại diện"
                      style={{ width: "100%", height: "auto", display: "block", minHeight: "150px", objectFit: "cover" }}
                    />
                  </div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                  />
                  <button
                    style={{ padding: "10px 20px", background: "#ff6b35", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "background 0.2s" }}
                    onClick={() =>
                      document.getElementById("avatar-upload").click()
                    }
                  >
                    Thay đổi ảnh đại diện
                  </button>
                  <p style={{ fontSize: "12px", color: "#666", textAlign: "center", lineHeight: "1.5" }}>
                    Hỗ trợ định dạng: PNG, SVG, JPG, GIF. Kích thước tối đa 5MB.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* -------- THÀNH TÍCH -------- */}
          <section style={{ background: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#333" }}>Thành tích</h3>
              <button style={{ padding: "8px 16px", background: "#ff6b35", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "background 0.2s" }} onClick={handleAddAchievement}>
                + Thêm thành tích
              </button>
            </div>

            {achievements.map((item) => (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: "0", marginBottom: "16px", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", background: "white" }} key={item.id}>
                {/* Cột nội dung chính */}
                <div style={{ gridColumn: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "12px", padding: "16px", paddingBottom: "12px", gridColumn: "1", border: "none" }}>
                    {/* Icon */}
                    <div style={{ width: "50px", height: "50px", borderRadius: "6px", overflow: "hidden", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      {item.icon ? (
                        <img src={item.icon} alt="icon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
                              fill="#999"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Textarea */}
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <textarea
                        placeholder="Vui lòng nhập mô tả"
                        value={item.description}
                        onChange={(e) => handleTextareaChange(e, item.id)}
                        rows="1"
                        style={{ width: "100%", minHeight: "50px", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", resize: "none", overflow: "hidden", transition: "border-color 0.2s" }}
                      />
                    </div>
                  </div>

                  {/* Upload section */}
                  <div style={{ gridColumn: "1", padding: "0 16px 16px 16px", paddingTop: "8px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <input
                      type="file"
                      id={`icon-upload-${item.id}`}
                      accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml"
                      style={{ display: "none" }}
                      onChange={(e) => handleIconUpload(e, item.id)}
                    />
                    <button
                      style={{ padding: "6px 12px", background: "white", color: "#ff6b35", border: "1px solid #ff6b35", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: "0" }}
                      onClick={() =>
                        document
                          .getElementById(`icon-upload-${item.id}`)
                          .click()
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17 8L12 3L7 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 3V15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Upload icon
                    </button>
                    <p style={{ fontSize: "12px", color: "#666", lineHeight: "1.5", margin: "0" }}>
                      Hỗ trợ định dạng: PNG, SVG, JPG, GIF. Kích thước tối đa:{" "}
                      <br />
                      5MB. Kích thước icon tiêu chuẩn: 50×50 pixel
                    </p>
                  </div>
                </div>

                {/* Khu vực xóa - Cột riêng với nền xám */}
                <div style={{ gridColumn: "2", gridRow: "1 / 3", background: "#f5f5f5", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px 8px", paddingTop: "16px", borderLeft: "1px solid #ddd" }}>
                  <button
                    style={{ width: "36px", height: "36px", background: "transparent", border: "none", borderRadius: "6px", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                    onClick={() => handleRemoveAchievement(item.id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* -------- MÔ TẢ -------- */}
          <section style={{ background: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#333" }}>Mô tả</h3>
            <div>
              {/* Custom CSS for Vietnamese QuillJS */}
              <style jsx>{`
                .ql-toolbar .ql-formats {
                  margin-right: 8px;
                }
                .ql-picker-label::before {
                  line-height: 18px;
                }
                /* Custom tooltips */
                .ql-toolbar button {
                  position: relative;
                }
                .ql-toolbar button:hover::after {
                  content: attr(title);
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  background: #333;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  white-space: nowrap;
                  z-index: 1000;
                  margin-bottom: 5px;
                }
                .ql-snow .ql-picker-options {
                  z-index: 1001;
                }
                /* Auto-expand editor based on content */
                .ql-container {
                  height: auto !important;
                  min-height: 400px;
                }
                .ql-editor {
                  min-height: 400px;
                  height: auto !important;
                  max-height: none;
                  overflow-y: visible;
                  padding-bottom: 30px;
                }
                /* Ensure images display correctly but don't interfere with resize */
                .ql-editor img {
                  max-width: 100%;
                  display: inline-block;
                }
                /* Adjust scrollbar for better UX */
                .ql-editor:focus {
                  outline: none;
                }
              `}</style>
              <ReactQuill
                key={`quill-${ceoId}`} // Chỉ sử dụng ceoId, không dùng content length
                ref={quillRef}
                value={editorContent}
                onChange={handleEditorChange}
                onBlur={() => {
                  // Capture any final changes when editor loses focus
                  const editor = document.querySelector('.ql-editor');
                  if (editor) {
                    const currentHTML = editor.innerHTML;
                    if (currentHTML !== editorContent) {
                      console.log('Content changed on blur, updating...');
                      setEditorContent(currentHTML);
                    }
                  }
                }}
                placeholder="Nhập mô tả chi tiết..."
                style={{ minHeight: "400px", marginBottom: "50px" }}
                modules={{
                  toolbar: toolbarOptions,
                  imageResize: {
                    parchment: Quill.import('parchment'),
                    modules: ['Resize', 'DisplaySize']
                  }
                }}
                formats={[
                  'size', 'header', 'bold', 'italic', 'underline', 'strike',
                  'color', 'background', 'script', 'list', 'bullet', 'indent',
                  'direction', 'align', 'blockquote', 'code-block',
                  'link', 'image', 'video', 'width', 'height', 'style'
                ]}
                readOnly={false}
              />
            </div>
          </section>

          {/* -------- THAO TÁC -------- */}
          <section style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "24px" }}>
            <button style={{ padding: "10px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", background: "white", color: "#666", border: "1px solid #ddd" }} onClick={handleCancel}>
              Hủy bỏ thay đổi
            </button>
            <button
              style={{ padding: "10px 24px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", background: "#ff6b35", color: "white", border: "none" }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Hoàn tất chỉnh sửa"}
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminCeo;