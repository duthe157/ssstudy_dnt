import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { uploadImage } from '../../redux/question/action';
import {
  aboutDetail,
  aboutUpdate,
  pageUpdate,
} from '../../redux/setting/action';
import { setLoader } from '../LoadingContext';

// const CDN = 'https://cdn.luyenthitiendat.vn/';
// const { Option } = Select;

class IntroPage extends Component {
  constructor(props) {
    super();
    this.state = {
      banner: { image_url: '', title: '', description: '' },
      selectedIndexSchedule: null,
      introduceTableData: [],
      historyTableData: [],
      newOrEditRowIndex: null,
      updateIcon: {},
      // validation states
      bannerErrors: {},
      tableRowErrors: {},
    };
  }

  async componentDidMount() {
    setLoader(true);
    await this.props.aboutDetail();

    if (this.props.about) {
      let contentData = this.props.about;
      await this.setState({
        banner: contentData?.banner || {},
        introduceTableData: contentData.introductions || [],
        historyTableData: contentData?.histories || [],
      });
    }
    setLoader(false);
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.bannerImage !== nextProps.bannerImage) {
      await this.setState({
        banner: nextProps.bannerImage,
      });
    }
  }

  // Banner changes
  _onChange = async (e) => {
    var name = e.target.name;
    let value = e.target.value;
    let checked = e.target.checked;
    let image_url = '';
    const files = e.target.files;

    if (name === 'is_featured' || name === 'status') {
      value = checked;
    }

    if (name === 'files') {
      // Validate image type and size (JPG/PNG, <= 1MB)
      const file = files && files[0];
      if (!file) return;
      const isValidType =
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.name.match(/\.(jpg|jpeg|png)$/i);
      const isValidSize = file.size <= 5 * 1024 * 1024;

      let bannerErrors = { ...this.state.bannerErrors };
      bannerErrors.imageType = !isValidType;
      bannerErrors.imageSize = !isValidSize;

      if (!isValidType || !isValidSize) {
        this.setState({ bannerErrors });
        return;
      }

      // Clear previous image errors
      delete bannerErrors.imageType;
      delete bannerErrors.imageSize;

      value = await new Promise(async (resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          image_url = reader.result;
          resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
      });

      value = [value];
      this.setState({
        [name]: value,
        banner: {
          ...this.state.banner,
          image_url,
        },
        bannerErrors,
      });

      setLoader(true);
      const data = new FormData();
      data.append('files', file);
      await this.props.uploadImage(data);
      this.setState({
        banner: {
          ...this.state.banner,
          image_url: this.props.image,
        },
      });
      setLoader(false);
    } else if (name === 'title' || name === 'description') {
      const banner = { ...this.state.banner, [name]: value };
      const bannerErrors = { ...this.state.bannerErrors };
      if (value) delete bannerErrors[name];
      // description length limit (use existing maxLength 100)
      if (name === 'description') {
        bannerErrors.descriptionTooLong = value && value.length > 550;
      }
      this.setState({ banner, bannerErrors });
    } else {
      this.setState({
        [name]: value,
      });
    }
  };

  handleUploadImage = () => {
    document.getElementById('input-upload-image').click();
  };

  removeBannerAvatar = () => {
    document.getElementById('input-upload-image').value = '';
    this.setState({
      files: [],
      banner: {
        ...this.state.banner,
        image_url: '',
      },
    });
  };

  // Drag and drop table rows
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  onDragEndItem = async (result, tableName) => {
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.state[tableName],
      result.source.index,
      result.destination.index
    );

    await this.setState({
      [tableName]: items,
    });
  };

  // Introduce and History table changes
  onAddRow = (tableName) => {
    const key = `${tableName}-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}`;
    const rowData = {
      order: key,
      image_url: '',
      title: '',
      year: '',
      description: '',
    };

    this.setState({
      updateIcon: {
        ...this.state.updateIcon,
        [key]: '/assets/img/icon-save.svg',
      },
      newOrEditRowIndex: {
        ...this.state.newOrEditRowIndex,
        [key]: true,
      },
      [tableName]: [...this.state[tableName], rowData],
    });
  };

  onEditOrSaveRow = (key, isSave = false) => {
    // If trying to save a row, validate row fields first
    if (isSave) {
      // find row location
      const introIdx = (this.state.introduceTableData || []).findIndex(
        (r) => r.order === key
      );
      const histIdx =
        introIdx === -1
          ? (this.state.historyTableData || []).findIndex(
              (r) => r.order === key
            )
          : -1;
      let errors = {};
      if (introIdx !== -1) {
        const row = this.state.introduceTableData[introIdx];
        errors = { title: !row?.title, description: !row?.description };
        // length limit for description
        if (row?.description && row.description.length > 100)
          errors.descriptionTooLong = true;
      } else if (histIdx !== -1) {
        const row = this.state.historyTableData[histIdx];
        const isNumeric = row?.year && /^\d+$/.test(String(row.year).trim());
        errors = { year: !isNumeric, description: !row?.description };
        if (row?.description && row.description.length > 150)
          errors.descriptionTooLong = true;
      }
      if (Object.values(errors).some(Boolean)) {
        this.setState({
          tableRowErrors: { ...this.state.tableRowErrors, [key]: errors },
        });
        return;
      } else if (this.state.tableRowErrors?.[key]) {
        const next = { ...this.state.tableRowErrors };
        delete next[key];
        this.setState({ tableRowErrors: next });
      }
    }
    const updateIcon = isSave
      ? {
          ...this.state.updateIcon,
          [key]: '/assets/img/icon-edit.svg',
        }
      : {
          ...this.state.updateIcon,
          [key]: '/assets/img/icon-save.svg',
        };
    this.setState({
      newOrEditRowIndex: {
        ...this.state.newOrEditRowIndex,
        [key]: !isSave,
      },
      updateIcon,
    });
  };

  onDeleteRow = (event, key, type) => {
    let tableDataName = type;

    const tableData = this.state[tableDataName].filter(
      (item) => item.order !== key
    );
    this.setState({
      [tableDataName]: tableData,
    });
  };

  onTableInputChange = (event, index, type) => {
    const propName = event.target.name;
    let tableData = this.state[type];
    tableData[index][propName] = event.target.value;

    // Clear row errors on change
    const key = tableData[index]?.order;
    const tableRowErrors = { ...this.state.tableRowErrors };
    if (key && tableRowErrors[key]) {
      if (propName === 'year') {
        // numeric check
        const isNumeric = /^\d+$/.test(event.target.value.trim());
        tableRowErrors[key].year = !isNumeric;
      } else {
        if (event.target.value) delete tableRowErrors[key][propName];
        // description length limit (100)
        if (propName === 'description') {
          tableRowErrors[key].descriptionTooLong =
            event.target.value && event.target.value.length > type === 'introduceTableData' ? 100 : 150;
        }
      }
      if (Object.keys(tableRowErrors[key]).length === 0)
        delete tableRowErrors[key];
    }

    this.setState({
      [type]: tableData,
      tableRowErrors,
    });
  };

  isSave = (key) => {
    return (
      this.state.updateIcon?.[key] &&
      !this.state.updateIcon[key].includes('edit')
    );
  };

  handleUploadTableImage = async (event, index, type) => {
    let tableDataName = type;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Validate image type and size (JPG/PNG, <= 5MB)
    const isValidType =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      (file.name && file.name.match(/\.(jpg|jpeg|png)$/i));
    const maxSize = 5 * 1024 * 1024; // 5MB
    const isValidSize = file.size <= maxSize;

    // mark per-row errors keyed by row order
    const tableData = this.state[tableDataName] || [];
    const rowKey = tableData[index] && tableData[index].order;
    const tableRowErrors = { ...(this.state.tableRowErrors || {}) };
    tableRowErrors[rowKey] = tableRowErrors[rowKey] || {};
    tableRowErrors[rowKey].imageType = !isValidType;
    tableRowErrors[rowKey].imageSize = !isValidSize;

    if (!isValidType || !isValidSize) {
      // keep error state so UI can show messages/styles and abort upload
      this.setState({ tableRowErrors });
      return;
    }

    // clear image errors for this row
    if (tableRowErrors[rowKey]) {
      delete tableRowErrors[rowKey].imageType;
      delete tableRowErrors[rowKey].imageSize;
      if (Object.keys(tableRowErrors[rowKey]).length === 0) delete tableRowErrors[rowKey];
    }

    this.setState({ tableRowErrors });

    // Optional preview read (keeps previous UX)
    const preview = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    setLoader(true);

    const data = new FormData();
    data.append('files', file);

    await this.props.uploadImage(data);
    let newTableData = [...this.state[tableDataName]];
    newTableData[index].image_url = this.props.image;
    this.setState({ [tableDataName]: newTableData });
    setLoader(false);
  };

  removeTableAvatar = (event, index) => {
    const tableName = event.target
      .closest('table')
      .getAttribute('id')
      .split('-')
      .pop();
    let tableDataName = `${tableName}Data`;

    const input = document.getElementById(
      `input-upload-table-${this.state[tableDataName][index].order}`
    );
    if (input) input.value = '';

    let tableData = [...this.state[tableDataName]];
    tableData[index].image_url = '';
    this.setState({ [tableDataName]: tableData });
  };

  onClickTableImage = (event, item, index, type) => {
    item.image_url
      ? this.removeTableAvatar(event, index)
      : document.getElementById(`${type}-input-upload-table-${item.order}`).click();
  };

  // Submit form
  handleSubmit = async (e) => {
    e.preventDefault();

    setLoader(true);
    let { banner, historyTableData, introduceTableData } =
      this.state;
    // Validate Banner and SSStudy
    const bannerErrors = {
      title: !banner?.title,
      description: !banner?.description,
    };

    // Block submit if any errors, including prior image errors
    const hasBannerInlineErrors =
      this.state.bannerErrors?.imageType || this.state.bannerErrors?.imageSize;
    const hasBannerRequired = Object.values(bannerErrors).some(Boolean);
    if (
      hasBannerInlineErrors ||
      hasBannerRequired
    ) {
      this.setState({ bannerErrors });
      setLoader(false);
      return;
    }

    const data = {
      key: 'about',
      content_configs: {
        banner: banner || {},
        histories: historyTableData || [],
        introductions: introduceTableData || [],
      },
    };

    await this.props.pageUpdate(data);
    setLoader(false);

    // this.props.aboutUpdate(data);
  };

  createRow(item, index, type) {
    return (
      <Draggable key={index} draggableId={'' + index} index={index}>
        {(provided, snapshot) => (
          <tr
            className="v-middle table-row-item"
            key={item.order}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <td
              className="text-center"
              {...provided.dragHandleProps}
              style={{ width: '100px' }}
            >
              <img src="/assets/img/icon-move.svg" alt="" />
            </td>
            <td
              className="text-center"
              style={{ padding: '10px 12px', width: '160px' }}
            >
              {this.state.newOrEditRowIndex?.[item.order] ? (
                <div>
                  <input
                    onChange={(event) =>
                      this.handleUploadTableImage(event, index, type)
                    }
                    type="file"
                    className="form-control-file d-none"
                    name={`${type}-input-upload-table-${item.order}`}
                    id={`${type}-input-upload-table-${item.order}`}
                    accept=".jpg, .jpeg, .png"
                  />
                  <div className="block-avatar block-image">
                    <div
                      className="block-image-overlay"
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <img
                        src={
                          item.image_url
                            ? item.image_url
                            : '/assets/img/no-image.png'
                        }
                        style={{ width: 80, height: 60, objectFit: 'contain' }}
                      />
                      <div className="middle">
                        <div
                          className="text"
                          onClick={(event) =>
                            this.onClickTableImage(event, item, index, type)
                          }
                        >
                          {item.image_url ? 'Hủy' : 'Thay đổi'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={
                    item.image_url ? item.image_url : '/assets/img/no-image.png'
                  }
                  alt=""
                  style={{ width: 80, height: 60, objectFit: 'contain' }}
                />
              )}
            </td>
            <td
              className="text-left"
              style={{ padding: '10px 12px', width: '250px' }}
            >
              {this.state.newOrEditRowIndex?.[item.order] ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập vào.."
                  defaultValue={
                    (type === 'introduceTableData'
                      ? item?.title
                      : item?.year) || ''
                  }
                  name={type === 'introduceTableData' ? 'title' : 'year'}
                  maxLength={type === 'introduceTableData' ? 20 : 4}
                  onChange={(event) => this.onTableInputChange(event, index, type)}
                  style={{
                    border: this.state.tableRowErrors?.[item.order]?.[
                      type === 'introduceTableData' ? 'title' : 'year'
                    ]
                      ? '1px solid #f5222d'
                      : undefined,
                  }}
                />
              ) : (
                (type === 'introduceTableData' ? item?.title : item?.year) || ''
              )}
              {this.state.newOrEditRowIndex?.[item.order] &&
                this.state.tableRowErrors?.[item.order]?.[
                  type === 'introduceTableData' ? 'title' : 'year'
                ] && (
                  <div style={{ color: '#f5222d', marginTop: 6 }}>
                    {type === 'introduceTableData'
                      ? 'Vui lòng nhập tiêu đề khối nội dung.'
                      : 'Năm phải là một số hợp lệ.'}
                  </div>
                )}
            </td>
            <td
              className="text-left"
              style={{
                padding: '10px 12px',
                width: '400px',
                wordBreak: 'break-word',
              }}
            >
              {this.state.newOrEditRowIndex?.[item.order] ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập vào.."
                  defaultValue={item.description}
                  name="description"
                  maxLength={type === 'introduceTableData' ? 100 : 150}
                  onChange={(event) => this.onTableInputChange(event, index, type)}
                  style={{
                    border: this.state.tableRowErrors?.[item.order]?.description
                      ? '1px solid #f5222d'
                      : undefined,
                  }}
                />
              ) : (
                item.description
              )}
              {this.state.newOrEditRowIndex?.[item.order] &&
                this.state.tableRowErrors?.[item.order]?.description && (
                  <div style={{ color: '#f5222d', marginTop: 6 }}>
                    Vui lòng nhập mô tả cho cột mốc.
                  </div>
                )}
              {this.state.newOrEditRowIndex?.[item.order] &&
                this.state.tableRowErrors?.[item.order]?.descriptionTooLong && (
                  <div style={{ color: '#f5222d', marginTop: 6 }}>
                    Mô tả không được vượt quá {type === 'introduceTableData' ? 100 : 150} ký tự.
                  </div>
                )}
            </td>
            <td
              className="text-center"
              style={{ padding: '10px 12px', minWidth: '200px' }}
            >
              <div className="item-action" style={{ justifyContent: 'center' }}>
                <a
                  className="mr-14"
                  data-toggle="modal"
                  data-target="#edit-item"
                  data-toggle-class="fade-down"
                  data-toggle-class-target=".animate"
                  title="Chỉnh sửa"
                  onClick={() =>
                    this.onEditOrSaveRow(item.order, this.isSave(item.order))
                  }
                >
                  <img
                    src={
                      this.state.updateIcon?.[item.order] ||
                      '/assets/img/icon-edit.svg'
                    }
                    alt=""
                  />
                </a>
                <a
                  data-toggle="modal"
                  data-target="#delete-item"
                  data-toggle-classname="fade-down"
                  data-toggle-class-target=".animate"
                  title="Xóa"
                  onClick={(event) => this.onDeleteRow(event, item.order, type)}
                >
                  <img src="/assets/img/icon-delete.svg" alt="" />
                </a>
              </div>
            </td>
          </tr>
        )}
      </Draggable>
    );
  }

  fetchRows(data, type) {
    data = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (data instanceof Array) {
      return data.map((object, i) => {
        return this.createRow(object, i, type);
      });
    }
  }

  render() {
    return (
      <div>
        <div
          className="page-content page-container setting-intro-page"
          id="page-content"
        >
          <div className="padding" style={{ padding: '16px 24px' }}>
            <h2 className="text-md text-highlight sss-page-title">
              Cài đặt trang giới thiệu
            </h2>
            <div className="block-item-content">
              <h3 className="title-block">Banner</h3>
              <div className="block-banner-title-desc">
                <input
                  onChange={this._onChange}
                  type="file"
                  className="form-control-file d-none"
                  name="files"
                  id="input-upload-image"
                  accept=".jpg, .jpeg, .png"
                />
                <div
                  className="block-avatar block-image"
                  style={{
                    height: 250,
                    width: 300,
                    border: this.state.bannerErrors?.image_url
                      ? '1px solid #f5222d'
                      : undefined,
                  }}
                >
                  {!this.state.banner.image_url ? (
                    <button type="button" onClick={this.handleUploadImage}>
                      <img
                        src="/assets/img/icon-upload-file.svg"
                        className="mr-10"
                        alt=""
                      />
                      <span>Thêm ảnh</span>
                    </button>
                  ) : (
                    <div className="block-image-overlay">
                      <img
                        id="output"
                        src={this.state.banner.image_url}
                        alt="your image"
                        className="image"
                      />
                      <div className="middle">
                        <div className="text" onClick={this.removeBannerAvatar}>
                          Hủy chọn
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {this.state.bannerErrors?.imageType && (
                  <div style={{ color: '#f5222d', marginTop: 6 }}>
                    Hình ảnh phải có định dạng JPG hoặc PNG.
                  </div>
                )}
                {this.state.bannerErrors?.imageSize && (
                  <div style={{ color: '#f5222d', marginTop: 6 }}>
                    Hình ảnh không được vượt quá 5MB.
                  </div>
                )}
                <div
                  className="flex"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <div className="form-group mb-0">
                    <div className="text-form-label mb-8">Tiêu đề</div>
                    <textarea
                      value={this.state.banner.title}
                      placeholder="Nhập tiêu đề"
                      onChange={this._onChange}
                      className="form-control"
                      name="title"
                      maxLength={100}
                      style={{
                        height: 48,
                        border: this.state.bannerErrors?.title
                          ? '1px solid #f5222d'
                          : undefined,
                      }}
                    />
                    {this.state.bannerErrors?.title && (
                      <div style={{ color: '#f5222d', marginTop: 6 }}>
                        Vui lòng nhập tiêu đề banner.
                      </div>
                    )}
                  </div>
                  <div className="form-group mb-0">
                    <div className="text-form-label mb-8">Mô tả ngắn</div>
                    <textarea
                      placeholder="Nhập mô tả"
                      value={this.state.banner.description}
                      onChange={this._onChange}
                      className="form-control"
                      name="description"
                      style={{
                        height: 140,
                        border: this.state.bannerErrors?.description
                          ? '1px solid #f5222d'
                          : undefined,
                      }}
                      maxLength={550}
                    />
                    {this.state.bannerErrors?.description && (
                      <div style={{ color: '#f5222d', marginTop: 6 }}>
                        Vui lòng nhập mô tả banner.
                      </div>
                    )}
                    {this.state.bannerErrors?.descriptionTooLong && (
                      <div style={{ color: '#f5222d', marginTop: 6 }}>
                        Mô tả không được vượt quá 550 ký tự.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="block-item-content">
              <h3 className="title-block">Giới thiệu</h3>
              <div className="block-list-product">
                <table
                  className="table table-theme table-row v-middle"
                  id="introducePage-introduceTable"
                >
                  <thead className="text-muted">
                    <tr>
                      <th className="th-custom"></th>
                      <th className="text-center th-custom">Image</th>
                      <th className="text-left th-custom">Tiêu đề</th>
                      <th className="text-left th-custom">Mô tả</th>
                      <th className="text-center th-custom">Hành động</th>
                    </tr>
                  </thead>
                  <DragDropContext
                    onDragEnd={async (result) =>
                      await this.onDragEndItem(result, 'introduceTableData')
                    }
                  >
                    <Droppable droppableId="introduceTable-droppable">
                      {(provided, snapshot) => (
                        <tbody
                          ref={provided.innerRef}
                          style={{
                            background: snapshot.isDragging
                              ? '#e8f0fe'
                              : 'none',
                          }}
                        >
                          {this.fetchRows(
                            this.state.introduceTableData,
                            'introduceTableData'
                          )}

                          {!this.data ||
                            (this.data.length == 0 && (
                              <tr>
                                <td colSpan={7} className="text-center">
                                  Chưa có câu hỏi nào!
                                </td>
                              </tr>
                            ))}
                          {provided.placeholder}
                        </tbody>
                      )}
                    </Droppable>
                  </DragDropContext>
                </table>
                <button
                  className="btn btn-outline-default"
                  style={{ width: '100%' }}
                  onClick={() => this.onAddRow('introduceTableData')}
                >
                  <span className="mr-8">+</span>
                  <span>Thêm mới</span>
                </button>
              </div>
            </div>

            <div className="block-item-content">
              <h3 className="title-block">Lịch sử hình thành</h3>
              <div className="block-list-product">
                <table
                  className="table table-theme table-row v-middle"
                  id="introducePage-historyTable"
                >
                  <thead className="text-muted">
                    <tr>
                      <th className="th-custom"></th>
                      <th className="text-center th-custom">Image</th>
                      <th className="text-left th-custom">Năm</th>
                      <th className="text-left th-custom">Mô tả</th>
                      <th className="text-center th-custom">Hành động</th>
                    </tr>
                  </thead>
                  <DragDropContext
                    onDragEnd={async (result) =>
                      await this.onDragEndItem(result, 'historyTableData')
                    }
                  >
                    <Droppable droppableId="historyTable-droppable">
                      {(provided, snapshot) => (
                        <tbody
                          ref={provided.innerRef}
                          style={{
                            background: snapshot.isDragging
                              ? '#e8f0fe'
                              : 'none',
                          }}
                        >
                          {this.fetchRows(
                            this.state.historyTableData,
                            'historyTableData'
                          )}

                          {!this.data ||
                            (this.data.length == 0 && (
                              <tr>
                                <td colSpan={7} className="text-center">
                                  Chưa có câu hỏi nào!
                                </td>
                              </tr>
                            ))}
                          {provided.placeholder}
                        </tbody>
                      )}
                    </Droppable>
                  </DragDropContext>
                </table>
                <button
                  className="btn btn-outline-default"
                  style={{ width: '100%' }}
                  onClick={() => this.onAddRow('historyTableData')}
                >
                  <span className="mr-8">+</span>
                  <span>Thêm mới</span>
                </button>
              </div>
            </div>

            <div className="block-action-footer">
              <button type="button" className="btn-cancel" onClick={() => window.location.reload()}>
                <img
                  src="/assets/img/icon-arrow-left.svg"
                  alt=""
                  className="mr-14"
                />
                Hủy bỏ thay đổi
              </button>
              <button
                type="button"
                className="btn-submit ml-16"
                onClick={(e) => this.handleSubmit(e)}
              >
                Hoàn tất chỉnh sửa
                <img
                  src="/assets/img/icon-arrow-right.svg"
                  alt=""
                  className="ml-14"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    image: state.question.image,
    about: state.setting.about,
    data: state.setting.data,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      uploadImage,
      aboutDetail,
      aboutUpdate,
      pageUpdate,
    },
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IntroPage)
);
