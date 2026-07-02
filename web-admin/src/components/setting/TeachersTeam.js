import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import axios from 'axios';
import { initAPI } from "../../config/api";

const TeachersTeam = () => {
  const [pageTitle, setPageTitle] = useState('Đội ngũ giáo viên tại SSStudy');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [highlights, setHighlights] = useState([
    { id: 1, image: null, title: '', description: '' },
    { id: 2, image: null, title: '', description: '' },
    { id: 3, image: null, title: '', description: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [dataId, setDataId] = useState(null);

  useEffect(() => {
    loadTeachersTeamData();
  }, []);

  const loadTeachersTeamData = async () => {
    try {
      initAPI();
      setLoading(true);

      const response = await axios.post('/teachers-team/detail', {});
      const data = response.data.data;

      setDataId(data._id);
      setPageTitle(data.title || 'Đội ngũ giáo viên tại SSStudy');
      setContent(data.content || '');

      if (data.images && data.images.length > 0) {
        const loadedImages = data.images.map((img, index) => ({
          id: Date.now() + index,
          url: img.url,
          file: null
        }));
        setImages(loadedImages);
      }

      if (data.highlights && data.highlights.length > 0) {
        const loadedHighlights = data.highlights.map((h, index) => ({
          id: index + 1,
          image: h.image ? { url: h.image.url, file: null } : null,
          title: h.title || '',
          description: h.description || ''
        }));
        setHighlights(loadedHighlights);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      initAPI();
      setLoading(true);

      const requestData = {
        _id: dataId,
        title: pageTitle,
        content: content,
        images: images.map(img => ({
          url: img.url
        })),
        highlights: highlights.map(h => ({
          image: h.image ? { url: h.image.url } : null,
          title: h.title,
          description: h.description
        })),
        status: true
      };

      const response = await axios.post('/teachers-team/update', requestData);

      if (response.data.status === 200) {
        alert('Lưu thành công!');
        await loadTeachersTeamData();
      } else {
        alert(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          id: Date.now() + Math.random(),
          url: reader.result,
          file: file
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleHighlightImageUpload = (e, highlightId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedHighlights = highlights.map(h =>
          h.id === highlightId
            ? { ...h, image: { url: reader.result, file: file } }
            : h
        );
        setHighlights(updatedHighlights);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteHighlightImage = (highlightId) => {
    const updatedHighlights = highlights.map(h =>
      h.id === highlightId
        ? { ...h, image: null }
        : h
    );
    setHighlights(updatedHighlights);
  };

  const handleHighlightChange = (highlightId, field, value) => {
    const updatedHighlights = highlights.map(h =>
      h.id === highlightId
        ? { ...h, [field]: value }
        : h
    );
    setHighlights(updatedHighlights);
  };

  return (
    <div className="page-content page-container setting-intro-page" id="page-content">
      <div className="padding">
        <h2 className='text-md text-highlight sss-page-title'>Đội ngũ giáo viên</h2>

        {loading && <div className="loading-spinner">Đang tải...</div>}

        <div className="block-item-content">
          {/* Tên trang */}
          <div className="form-group mb-4">
            <label className="text-form-label mb-2">Tên trang</label>
            <input
              type="text"
              className="form-control"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Đội ngũ giáo viên tại SSStudy"
              disabled={loading}
            />
          </div>

          {/* Mô tả */}
          <div className="form-group mb-4">
            <label className="text-form-label mb-2">Mô tả</label>

            <SunEditor
              setContents={content}
              onChange={setContent}
              setOptions={{
                height: 400,
                buttonList: [
                  ['undo', 'redo'],
                  ['font', 'fontSize', 'formatBlock'],
                  ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                  ['fontColor', 'hiliteColor', 'textStyle'],
                  ['removeFormat'],
                  ['outdent', 'indent'],
                  ['align', 'horizontalRule', 'list', 'lineHeight'],
                  ['table', 'link', 'image', 'video', 'audio'],
                  ['fullScreen', 'showBlocks', 'codeView'],
                  ['preview', 'print']
                ],
                defaultStyle: 'font-family: Arial; font-size: 14px;'
              }}
              placeholder="Nhập nội dung..."
              disable={loading}
            />
          </div>

          {/* Upload ảnh */}
          <div className="form-group mb-4">
            <label className="text-form-label mb-2">Ảnh mô tả</label>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    style={{
                      position: 'relative',
                      width: '180px',
                      height: '120px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={loading}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '200px',
                  height: '120px',
                  background: loading ? '#ccc' : '#FF8A65',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Upload ảnh
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg,image/gif"
                  multiple
                  onChange={handleImageUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#666',
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              Hỗ trợ định dạng: PNG, SVG, JPG, GIF. Kích thước tối đa: 5MB.
            </p>
          </div>

          {/* Thông tin nổi bật */}
          <div className="form-group mb-4">
            <label className="text-form-label mb-2" style={{ color: '#FF8A65', fontSize: '18px', fontWeight: '600' }}>
              Thông tin nổi bật
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {highlights.map((highlight) => (
                <div key={highlight.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Upload ảnh */}
                  <label
                    style={{
                      width: '100%',
                      height: '150px',
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      background: highlight.image ? 'transparent' : '#fafafa',
                      overflow: 'hidden',
                      position: 'relative',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {highlight.image ? (
                      <>
                        <img
                          src={highlight.image.url}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteHighlightImage(highlight.id);
                          }}
                          disabled={loading}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            zIndex: 10
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF8A65" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>Thêm ảnh</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/gif"
                      onChange={(e) => handleHighlightImageUpload(e, highlight.id)}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Tiêu đề */}
                  <div>
                    <label style={{ fontSize: '14px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                      Tiêu đề
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={highlight.title}
                      onChange={(e) => handleHighlightChange(highlight.id, 'title', e.target.value)}
                      placeholder="Tiêu đề"
                      disabled={loading}
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label style={{ fontSize: '14px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                      Mô tả
                    </label>
                    <textarea
                      className="form-control"
                      value={highlight.description}
                      onChange={(e) => handleHighlightChange(highlight.id, 'description', e.target.value)}
                      placeholder="Mô tả"
                      rows="3"
                      disabled={loading}
                      style={{ fontSize: '14px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="block-action-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
            Hủy bỏ thay đổi
          </button>
          <button
            type="button"
            className="btn-submit ml-16"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Hoàn tất chỉnh sửa'}
            <img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeachersTeam;