import React, { Component } from 'react';
import Moment from 'moment';
import { notification } from 'antd';
import { withRouter } from 'react-router-dom';

// Modal Animation Styles
const modalAnimationStyles = `
	@keyframes fadeInOverlay {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUpModal {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeOutOverlay {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes slideDownModal {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(30px);
		}
	}

	.lucky-money-modal-overlay {
		animation: fadeInOverlay 0.3s ease-out forwards;
	}

	.lucky-money-modal-overlay.closing {
		animation: fadeOutOverlay 0.3s ease-in forwards;
	}

	.lucky-money-modal-box {
		animation: slideUpModal 0.4s ease-out forwards;
	}

	.lucky-money-modal-box.closing {
		animation: slideDownModal 0.4s ease-in forwards;
	}
`;

// Inject animation styles into document
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = modalAnimationStyles;
    document.head.appendChild(style);
}

// Mock API
const mockLuckyMoneyAPI = {
    list: () => {
        return Promise.resolve({
            code: 200,
            data: {
                records: [
                    { _id: 1, name: 'LÌ xÌ Tết', description: 'LÌ xÌ cho dịp Tết', banner: 'https://r2.fivemanage.com/MgZ2yg18m7ozG2FLWcJwL/WhatsAppImage2026-02-06at11.24.28.jpeg', type: 'DE_THI', url_redirect: 'https://example.com/tet', status: 'ACTIVE', created_at: new Date() },
                    { _id: 2, name: 'LÌ xÌ Noel', description: 'LÌ xÌ cho dịp Noel', banner: 'https://r2.fivemanage.com/MgZ2yg18m7ozG2FLWcJwL/WhatsAppImage2026-02-06at11.24.28.jpeg', type: 'KY_THI', url_redirect: 'https://example.com/noel', status: 'ACTIVE', created_at: new Date() },
                    { _id: 3, name: 'LÌ xÌ Sinh nhật', description: 'LÌ xÌ cho dịp Sinh nhật', banner: 'https://r2.fivemanage.com/MgZ2yg18m7ozG2FLWcJwL/WhatsAppImage2026-02-06at11.24.28.jpeg', type: 'KY_THI', url_redirect: 'https://example.com/birthday', status: 'INACTIVE', created_at: new Date() },
                ],
                totalRecord: 3,
                perPage: 20
            }
        });
    },
    create: (data) => {
        return Promise.resolve({
            code: 200,
            data: { _id: Math.random(), ...data, created_at: new Date() }
        });
    },
    update: (data) => {
        return Promise.resolve({
            code: 200,
            data
        });
    },
    delete: (id) => {
        return Promise.resolve({
            code: 200,
            data: {}
        });
    }
};

class Row extends Component {
    constructor(props) {
        super();
        this.state = {};
    }

    handleEdit = () => {
        this.props.onEdit(this.props.obj);
    };

    handleDelete = () => {
        if (window.confirm('Bạn chắc chắn muốn xóa lì xì này?')) {
            this.props.onDelete(this.props.obj._id);
        }
    };

    render() {
        const { obj } = this.props;

        return (
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: '#fff',
                padding: '16px',
                marginBottom: '10px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ minWidth: '100px' }}>
                        <img
                            src={obj.banner}
                            alt={obj.name}
                            style={{
                                width: '100px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <div style={{ minWidth: '120px' }}>
                        <label style={{ fontSize: '12px', color: '#999' }}>Tên</label>
                        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{obj.name}</p>
                    </div>
                    <div style={{ minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', color: '#999' }}>Mô tả</label>
                        <p style={{ margin: '4px 0' }}>{obj.description}</p>
                    </div>
                    <div style={{ minWidth: '180px' }}>
                        <label style={{ fontSize: '12px', color: '#999' }}>URL Redirect</label>
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#0066cc', cursor: 'pointer' }}>{obj.url_redirect}</p>
                    </div>
                    <div style={{ minWidth: '80px' }}>
                        <label style={{ fontSize: '12px', color: '#999' }}>Loại</label>
                        <p style={{ margin: '4px 0' }}>
                            {obj.type === 'DE_THI' ? 'Đề Thi' : obj.type === 'KY_THI' ? 'Kỳ Thi' : 'Khác'}
                        </p>
                    </div>
                    <div style={{ minWidth: '100px' }}>
                        <label style={{ fontSize: '12px', color: '#999' }}>Trạng Thái</label>
                        <p style={{ margin: '4px 0' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                backgroundColor: obj.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                                color: obj.status === 'ACTIVE' ? '#155724' : '#721c24'
                            }}>
                                {obj.status === 'ACTIVE' ? 'Hoạt Động' : 'Đã Vô Hiệu Hóa'}
                            </span>
                        </p>
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <label style={{ fontSize: '12px', color: '#999' }}>Ngày tạo</label>
                        <p style={{ margin: '4px 0', fontSize: '12px' }}>{Moment(obj.created_at).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                        <button className="btn btn-sm btn-primary mr-2" onClick={this.handleEdit}>
                            Sửa
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={this.handleDelete}>
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class LuckyMoney extends Component {
    constructor(props) {
        super();
        this.state = {
            luckyMoneyList: [],
            total: 0,
            showModal: false,
            closingModal: false,
            editingItem: null,
            formData: {
                name: '',
                description: '',
                banner: '',
                url_redirect: '',
                type: 'DE_THI',
                status: 'ACTIVE',
                scoreConfigs: []
            },
            tempScoreInput: { point: '', image: '' },
            isLoading: false
        };
    }

    async componentDidMount() {
        await this.getData();
    }

    getData = async () => {
        this.setState({ isLoading: true });
        try {
            const res = await mockLuckyMoneyAPI.list();
            if (res.code === 200) {
                this.setState({
                    luckyMoneyList: res.data.records,
                    total: res.data.totalRecord
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải dữ liệu',
                placement: 'topRight'
            });
        } finally {
            this.setState({ isLoading: false });
        }
    };

    handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && name === 'banner') {
            // For file input, store the file object temporarily
            // In real scenario, backend will return URL after upload
            const file = files[0];
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                this.setState({
                    formData: { ...this.state.formData, banner: previewUrl, bannerFile: file }
                });
            }
        } else {
            this.setState({
                formData: { ...this.state.formData, [name]: value }
            });
        }
    };

    handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file);
            this.setState({
                formData: { ...this.state.formData, banner: previewUrl, bannerFile: file }
            });
        }
    };

    handleRemoveBanner = () => {
        this.setState({
            formData: { ...this.state.formData, banner: '', bannerFile: null }
        });
    };

    handleScoreInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && name === 'scoreImage') {
            const file = files[0];
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                this.setState({
                    tempScoreInput: { ...this.state.tempScoreInput, image: previewUrl, imageFile: file }
                });
            }
        } else {
            this.setState({
                tempScoreInput: { ...this.state.tempScoreInput, [name]: value }
            });
        }
    };

    handleAddScore = () => {
        const { tempScoreInput, formData } = this.state;
        if (!tempScoreInput.point || !tempScoreInput.image) {
            notification.warning({
                message: 'Cảnh báo',
                description: 'Vui lòng điền điểm số và chọn ảnh',
                placement: 'topRight'
            });
            return;
        }

        const newScore = {
            id: Date.now(),
            point: tempScoreInput.point,
            image: tempScoreInput.image
        };

        this.setState({
            formData: {
                ...formData,
                scoreConfigs: [...formData.scoreConfigs, newScore]
            },
            tempScoreInput: { point: '', image: '' }
        });
    };

    handleRemoveScore = (scoreId) => {
        const { formData } = this.state;
        this.setState({
            formData: {
                ...formData,
                scoreConfigs: formData.scoreConfigs.filter(s => s.id !== scoreId)
            }
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { formData, editingItem } = this.state;

        if (!formData.name || !formData.url_redirect) {
            notification.warning({
                message: 'Cảnh báo',
                description: 'Vui lòng điền đầy đủ thông tin (tên, banner, URL)',
                placement: 'topRight'
            });
            return;
        }

        try {
            // Simulate file upload - in real app, FormData would be sent to backend
            let submitData = { ...formData };

            // If banner is a local preview (starts with blob:), simulate backend returning a URL
            if (formData.banner && formData.banner.startsWith('blob:')) {
                submitData.banner = 'https://r2.fivemanage.com/MgZ2yg18m7ozG2FLWcJwL/WhatsAppImage2026-02-06at11.24.28.jpeg';
            }

            let res;
            if (editingItem) {
                // Edit mode
                res = await mockLuckyMoneyAPI.update({ ...submitData, _id: editingItem._id });
                if (res.code === 200) {
                    notification.success({
                        message: 'Thành công',
                        description: 'Cập nhật thành công',
                        placement: 'topRight'
                    });
                }
            } else {
                // Add mode
                res = await mockLuckyMoneyAPI.create(submitData);
                if (res.code === 200) {
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm thành công',
                        placement: 'topRight'
                    });
                }
            }

            if (res.code === 200) {
                this.setState({ closingModal: true });

                setTimeout(async () => {
                    this.setState({
                        showModal: false,
                        closingModal: false,
                        editingItem: null,
                        formData: { name: '', description: '', banner: '', url_redirect: '', type: 'DE_THI', status: 'ACTIVE', scoreConfigs: [] }
                    });
                    await this.getData();
                }, 400);
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: editingItem ? 'Không thể cập nhật' : 'Không thể thêm',
                placement: 'topRight'
            });
        }
    };

    handleUpdate = async (updatedData) => {
        try {
            const res = await mockLuckyMoneyAPI.update(updatedData);
            if (res.code === 200) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật lì xì thành công',
                    placement: 'topRight'
                });
                await this.getData();
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể cập nhật lì xì',
                placement: 'topRight'
            });
        }
    };

    handleDelete = async (id) => {
        try {
            const res = await mockLuckyMoneyAPI.delete(id);
            if (res.code === 200) {
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa lì xì thành công',
                    placement: 'topRight'
                });
                await this.getData();
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể xóa lì xì',
                placement: 'topRight'
            });
        }
    };

    handleOpenAddModal = () => {
        this.setState({
            showModal: true,
            editingItem: null,
            formData: { name: '', description: '', banner: '', url_redirect: '', type: 'DE_THI', status: 'ACTIVE', scoreConfigs: [] },
            tempScoreInput: { point: '', image: '' }
        });
    };

    handleEditClick = (item) => {
        this.setState({
            showModal: true,
            editingItem: item,
            formData: {
                name: item.name,
                description: item.description,
                banner: item.banner,
                url_redirect: item.url_redirect,
                type: item.type,
                status: item.status,
                scoreConfigs: item.scoreConfigs || []
            },
            tempScoreInput: { point: '', image: '' }
        });
    };

    handleFormCancel = () => {
        this.setState({ closingModal: true });

        setTimeout(() => {
            this.setState({
                showModal: false,
                closingModal: false,
                editingItem: null,
                formData: { name: '', description: '', banner: '', url_redirect: '', type: 'DE_THI', status: 'ACTIVE', scoreConfigs: [] },
                tempScoreInput: { point: '', image: '' }
            });
        }, 400);
    };

    fetchRows() {
        const { luckyMoneyList } = this.state;
        if (luckyMoneyList instanceof Array) {
            return luckyMoneyList.map((obj) => (
                <Row
                    obj={obj}
                    key={obj._id}
                    onUpdate={this.handleUpdate}
                    onDelete={this.handleDelete}
                    onEdit={this.handleEditClick}
                />
            ));
        }
        return null;
    }

    render() {
        const { luckyMoneyList, showModal, closingModal, formData, isLoading, total, editingItem, tempScoreInput } = this.state;
        const isEditing = !!editingItem;

        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <h2 className="text-md text-highlight sss-page-title">Quà tặng nhanh</h2>
                        <div className="block-table-lucky-money">
                            <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <div style={{ width: '400px' }}>
                                        Từ khóa
                                        <input
                                            type="text"
                                            className="form-control form-control-theme keyword-custom"
                                            placeholder="Tìm kiếm..."
                                            onChange={this.onChange}
                                            name="keyword"
                                            value={this.state.keyword}
                                        /></div>

                                    <div style={{ width: '300px' }}>
                                        Kỳ thi
                                        <select
                                            className="custom-select"
                                            value={this.state.subject_id}
                                            name="subject_id"
                                            onChange={this.onChangeSubject}
                                        >
                                            <option value=''>
                                                Tất cả kỳ thi
                                            </option>
                                            {/* {this.fetchRowsSubject()} */}
                                        </select>
                                    </div>
                                    <div style={{ width: '200px'}}>
                                        Trạng thái
                                        <select
                                            className="custom-select"
                                            value={this.state.populate_id}
                                            name="populate_id"
                                            onChange={this.handleChangeCompetition}
                                        >
                                            <option value='ALL'>
                                                Tất cả
                                            </option>
                                            <option value='ACTIVE'>Đang hoạt động</option>
                                            <option value='INACTIVE'>Đã tắt</option>
                                            {/* {this.fetchCategoryRows()} */}
                                        </select>
                                    </div>
                                </div>
                                <div style={{  display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button
                                        className="btn btn-primary"
                                        type='button'
                                        onClick={this.handleFilter}
                                        style={{ padding: '10px', height: '38px' , border: 'none' }}
                                    >
                                        Tìm kiếm
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={this.handleOpenAddModal}
                                        style={{ padding: '10px', height: '38px', border: 'none' }}
                                    >
                                        + Tạo quà tặng mới
                                    </button>
                                </div>
                            </div>

                            <div className="row" style={{ marginTop: '20px' }}>
                                <div className="col-sm-12">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {isLoading ? (
                                            <div className="text-center" style={{ padding: '20px' }}>Đang tải...</div>
                                        ) : luckyMoneyList.length === 0 ? (
                                            <div className="text-center" style={{ padding: '20px' }}>Không có dữ liệu</div>
                                        ) : (
                                            this.fetchRows()
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row listing-footer">
                                <div className="col-sm-12">
                                    <span>Tổng số: <b>{total}</b> lì xì</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Modal */}
                {showModal && (
                    <div
                        className={`lucky-money-modal-overlay${closingModal ? ' closing' : ''}`}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            // background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 999
                        }}
                        onClick={this.handleFormCancel}
                    >
                        <div
                            className={`lucky-money-modal-box${closingModal ? ' closing' : ''}`}
                            style={{
                                background: '#fff',
                                padding: '30px',
                                borderRadius: '8px',
                                maxWidth: '900px',
                                width: '95%',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ marginBottom: '20px' }}>{isEditing ? 'Sửa Lì xì' : 'Thêm Lì xì Mới'}</h3>
                            <form onSubmit={this.handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                {/* Left Column - Banner Upload */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Banner Ảnh</label>
                                    {formData.banner && (formData.banner.startsWith('blob:') || formData.banner.startsWith('https')) ? (
                                        <div style={{
                                            position: 'relative',
                                            display: 'block',
                                            width: '100%'
                                        }}>
                                            <img
                                                src={formData.banner}
                                                alt="Banner preview"
                                                style={{
                                                    width: '100%',
                                                    height: '250px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '2px solid #ddd',
                                                    display: 'block'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={this.handleRemoveBanner}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-12px',
                                                    right: '-12px',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#ff4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onDragOver={this.handleDragOver}
                                            onDrop={this.handleDrop}
                                            style={{
                                                border: '2px dashed #1890ff',
                                                borderRadius: '8px',
                                                padding: '40px 20px',
                                                textAlign: 'center',
                                                background: '#fafafa',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                minHeight: '250px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#f0f5ff';
                                                e.currentTarget.style.borderColor = '#40a9ff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#fafafa';
                                                e.currentTarget.style.borderColor = '#1890ff';
                                            }}
                                        >
                                            <input
                                                type="file"
                                                name="banner"
                                                accept="image/*"
                                                onChange={this.handleInputChange}
                                                style={{
                                                    display: 'none'
                                                }}
                                                id="banner-input"
                                            />
                                            <label
                                                htmlFor="banner-input"
                                                style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    width: '100%'
                                                }}
                                            >
                                                <span style={{ fontSize: '32px', marginBottom: '10px', color: '#1890ff', display: 'block' }} role="img" aria-label="camera">📸</span>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600', color: '#262626' }}>
                                                    Chọn ảnh hoặc kéo thả vào đây
                                                </p>
                                                <p style={{ margin: '0', fontSize: '12px', color: '#8c8c8c' }}>
                                                    Chỉ hỗ trợ các định dạng: JPG, PNG, GIF, WebP
                                                </p>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Form Fields */}
                                <div>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '14px', marginBottom: '5px' }}>Tên lì xì</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Nhập tên lì xì"
                                            value={formData.name}
                                            onChange={this.handleInputChange}
                                            style={{ fontSize: '14px' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '14px', marginBottom: '5px' }}>Mô tả</label>
                                        <input
                                            type="text"
                                            name="description"
                                            className="form-control"
                                            placeholder="Nhập mô tả"
                                            value={formData.description}
                                            onChange={this.handleInputChange}
                                            style={{ fontSize: '14px' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '14px', marginBottom: '5px' }}>URL Redirect</label>
                                        <input
                                            type="text"
                                            name="url_redirect"
                                            className="form-control"
                                            placeholder="Nhập URL redirect"
                                            value={formData.url_redirect}
                                            onChange={this.handleInputChange}
                                            style={{ fontSize: '14px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        <div className="form-group">
                                            <label style={{ fontSize: '14px', marginBottom: '5px' }}>Loại</label>
                                            <select
                                                name="type"
                                                className="custom-select"
                                                value={formData.type}
                                                onChange={this.handleInputChange}
                                                style={{ fontSize: '14px' }}
                                            >
                                                <option value="DE_THI">Đề Thi</option>
                                                <option value="KY_THI">Kỳ Thi</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '14px', marginBottom: '5px' }}>Trạng Thái</label>
                                            <select
                                                name="status"
                                                className="custom-select"
                                                value={formData.status}
                                                onChange={this.handleInputChange}
                                                style={{ fontSize: '14px' }}
                                            >
                                                <option value="ACTIVE">Hoạt Động</option>
                                                <option value="INACTIVE">Đã Vô Hiệu Hóa</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={this.handleFormCancel}
                                        >
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn btn-success">
                                            {isEditing ? 'Lưu Thay đổi' : 'Thêm Lì xì'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Score Configuration Section - Only for DE_THI */}
                            {formData.type === 'DE_THI' && (
                                <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
                                    <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>Cấu hình Điểm số</h4>

                                    {/* Score Input Form */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 2fr auto',
                                        gap: '10px',
                                        marginBottom: '20px',
                                        alignItems: 'flex-end'
                                    }}>
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label style={{ fontSize: '14px', marginBottom: '5px' }}>Điểm số</label>
                                            <input
                                                type="number"
                                                name="point"
                                                className="form-control"
                                                placeholder="Ví dụ: 100"
                                                value={tempScoreInput.point}
                                                onChange={this.handleScoreInputChange}
                                                style={{ fontSize: '14px' }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <label style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>Ảnh cho điểm số này</label>
                                            {tempScoreInput.image ? (
                                                <img
                                                    src={tempScoreInput.image}
                                                    alt="Score preview"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        border: '2px solid #ddd'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    border: '2px dashed #1890ff',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    background: '#fafafa',
                                                    color: '#1890ff',
                                                    fontSize: '20px'
                                                }}>
                                                    +
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                name="scoreImage"
                                                accept="image/*"
                                                onChange={this.handleScoreInputChange}
                                                style={{
                                                    position: 'absolute',
                                                    top: '30px',
                                                    left: '0',
                                                    width: '60px',
                                                    height: '60px',
                                                    opacity: '0',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={this.handleAddScore}
                                        >
                                            Thêm Điểm
                                        </button>
                                    </div>

                                    {/* Score List */}
                                    {formData.scoreConfigs.length > 0 && (
                                        <div style={{ marginTop: '20px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Các điểm số đã thêm:</label>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                                gap: '15px'
                                            }}>
                                                {formData.scoreConfigs.map((score) => (
                                                    <div
                                                        key={score.id}
                                                        style={{
                                                            position: 'relative',
                                                            textAlign: 'center',
                                                            padding: '10px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '6px',
                                                            background: '#fafafa'
                                                        }}
                                                    >
                                                        <img
                                                            src={score.image}
                                                            alt={`Score ${score.point}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '80px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                marginBottom: '8px'
                                                            }}
                                                        />
                                                        <p style={{
                                                            margin: '5px 0',
                                                            fontWeight: 'bold',
                                                            fontSize: '14px',
                                                            color: '#262626'
                                                        }}>
                                                            {score.point} điểm
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => this.handleRemoveScore(score.id)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '-8px',
                                                                right: '-8px',
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                background: '#ff4444',
                                                                color: '#fff',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '16px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(LuckyMoney);
