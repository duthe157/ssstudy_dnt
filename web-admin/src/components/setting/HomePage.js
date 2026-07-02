import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Select } from "antd";

import {
  uploadBanner,
  uploadImageOutstanding,
  uploadImageAudition
} from "../../redux/file/action";

import { pageUpdate, pageDetail } from "../../redux/setting/action";
import BaseHelpers from "../../helpers/BaseHelpers";


const CDN = "https://cdn.luyenthitiendat.vn/";
const { Option } = Select;

class SettingHomePage extends Component {
  constructor(props) {
    super();
    this.state = {
      banners: [],
      selectedIndexBanner: null,
      outstanding_numbers: [
        {
          image: "",
          title: "",
          num: "",
        },
        {
          image: "",
          title: "",
          num: "",
        },
        {
          image: "",
          title: "",
          num: "",
        },
        {
          image: "",
          title: "",
          num: "",
        }
      ],
      selectedIndexImgBox1: null,
      auditions: {
        title: "",
        description: "",
        data: [
          {
            image: "",
            title: "",
            description: "",
            text_link: "",
            button_link: ""
          },
          {
            image: "",
            title: "",
            description: "",
            text_link: "",
            button_link: ""
          },
          {
            image: "",
            title: "",
            description: "",
            text_link: "",
            button_link: ""
          },
        ]
      },
      block3: {
        title: "",
        description: ""
      },
      block4: {
        title: "",
        description: ""
      },
      selectedIndexImgBox2: null,
    };
  }

  async componentDidMount() {
    await this.props.pageDetail({
      key: "homepage"
    })

    if (this.props.contentConfigs) {
      let contentData = this.props.contentConfigs;

      await this.setState({
        banners: contentData.banners && contentData.banners.length > 0 ? contentData.banners : [],
        outstanding_numbers: contentData.block1 ? contentData.block1 : [],
        auditions: contentData.block2 ? contentData.block2 : {},
        block3: contentData.block3 ? contentData.block3 : {},
        block4: contentData.block4 ? contentData.block4 : {},
      })
    }
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.bannerImage !== nextProps.bannerImage) {
      let { selectedIndexBanner } = this.state;
      let _banners = [...this.state.banners];

      let dataBanner = _banners.map((item, index) => {
        if (index == selectedIndexBanner) {
          item.image = nextProps.bannerImage;
        }
        return item;
      })

      await this.setState({
        banners: dataBanner
      })
    }

    if (this.props.outstandingImage !== nextProps.outstandingImage) {
      let { selectedIndexImgBox1 } = this.state;
      let _outstandings = [...this.state.outstanding_numbers];

      let returnData = _outstandings.map((item, index) => {
        if (index == selectedIndexImgBox1) {
          item.image = nextProps.outstandingImage;
        }
        return item;
      })

      await this.setState({
        outstanding_numbers: returnData
      })
    }

    if (this.props.auditionImage !== nextProps.auditionImage) {
      let { selectedIndexImgBox2 } = this.state;
      let _auditions = [...this.state.auditions.data];

      let dataAudition = _auditions.map((item, index) => {
        if (index == selectedIndexImgBox2) {
          item.image = nextProps.auditionImage;
        }
        return item;
      })

      await this.setState({
        auditions: {
          ...this.state.auditions,
          data: dataAudition
        }
      })
    }
  }

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    let { banners, outstanding_numbers, auditions ,block3, block4 } = this.state;
    const data = {
      key: "homepage",
      content_configs: {
        banners: banners && banners.length > 0 ? banners : [],
        block1: outstanding_numbers,
        block2: auditions,
        block3: block3,
        block4: block4,
      }
    };


    this.props.pageUpdate(data)
  };

  onChangeDataOutstandingNumbers = async (e, _index) => {
    let { name, value } = e.target;

    let _outstandings = [...this.state.outstanding_numbers];

    let returnData = _outstandings.map((item, index) => {
      if (index == _index) {
        item[name] = value;
      }
      return item;
    })

    this.setState({
      outstanding_numbers: returnData
    })
  };

  onChangeImageBlock1 = async (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const form = BaseHelpers.getFormDataUpload(files, "homepage");
      if (form) {
        this.props.uploadImageOutstanding(form);
      }
    }
  }

  onChangeValueAudition = async (e, _index) => {
    let { name, value } = e.target;

    this.setState({
      auditions: {
        ...this.state.auditions,
        [name]: value
      }
    })
  }

  onChangeDataValueAudition = async (e, _index) => {
    let { name, value } = e.target;

    let _auditions = [...this.state.auditions.data];

    let returnData = _auditions.map((item, index) => {
      if (index == _index) {
        item[name] = value;
      }
      return item;
    })

    this.setState({
      auditions: {
        ...this.state.auditions,
        data: returnData
      }
    })
  };

  onChangeImageBlock2 = async (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const form = BaseHelpers.getFormDataUpload(files, "homepage");
      if (form) {
        this.props.uploadImageAudition(form);
      }
    }
  }

  onChangeBannersImage = async (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const form = BaseHelpers.getFormDataUpload(files, "homepage");
      if (form) {
        this.props.uploadBanner(form);
      }
    }
  }


  handleAddBanner = () => {
    let _banners = [...this.state.banners];

    let defaultBanner = {
      image: "",
      link: "",
    }


    _banners.push(defaultBanner);

    this.setState({
      banners: _banners
    })
  }

  handleUploadImageBanner = (index) => {
    this.setState({
      selectedIndexBanner: index
    })
    document.getElementById("input-add-banner").click();
  }

  removeImageBanner = async (_index) => {
    document.getElementById("input-add-banner").value = "";

    let _banners = [...this.state.banners];

    let dataRemoveBanner = _banners.map((item, index) => {
      if (index == _index) {
        item.image = "";
      }
      return item;
    })

    this.setState({
      banners: dataRemoveBanner
    })
  }

  onChangeValueBanner = async (e, _index) => {
    let { name, value } = e.target;

    let _banners = [...this.state.banners];

    let returnData = _banners.map((item, index) => {
      if (index == _index) {
        item[name] = value;
      }
      return item;
    })

    this.setState({
      banners: returnData
    })

  }

  deleteBannerItem = async (index) => {

    let _banners = [...this.state.banners];
    _banners.splice(index, 1);

    this.setState({
      banners: _banners
    })
  }


  handleUploadImageBlock1 = (index) => {
    this.setState({
      selectedIndexImgBox1: index
    })
    document.getElementById("input-img-block-1").click();
  }


  remoImgBlock1 = async (_index) => {
    document.getElementById("input-img-block-1").value = "";

    let _outstandings = [...this.state.outstanding_numbers];

    let dataRemoveOutstanding = _outstandings.map((item, index) => {
      if (index == _index) {
        item.image = "";
      }
      return item;
    })

    this.setState({
      outstanding_numbers: dataRemoveOutstanding
    })
  }



  handleUploadImageBlock2 = (index) => {
    this.setState({
      selectedIndexImgBox2: index
    })
    document.getElementById("input-img-block-2").click();
  }


  remoImgBlock2 = async (_index) => {
    document.getElementById("input-img-block-2").value = "";

    let _auditions = [...this.state.auditions.data];

    let dataRemoveAudition = _auditions.map((item, index) => {
      if (index == _index) {
        item.image = "";
      }
      return item;
    })

    this.setState({
      auditions: {
        ...this.state.auditions,
        data: dataRemoveAudition
      }
    })
  }


  onChangeValueBlock3 = async (e) => {
    let { name, value } = e.target;

    this.setState({
      block3: {
        ...this.state.block3,
        [name]: value
      }
    })
  }

  onChangeValueBlock4 = async (e) => {
    let { name, value } = e.target;

    this.setState({
      block4: {
        ...this.state.block4,
        [name]: value
      }
    })
  }




  render() {
    const { banners, outstanding_numbers, auditions, block3, block4 } = this.state;
    return (
      <div>
        <div className="page-content page-container setting-home-page" id="page-content">
          <div className="padding">
            <h2 className='text-md text-highlight sss-page-title'>Cài đặt trang chủ</h2>
            <div className="block-item-content">
              <h3 className="title-block">Banner</h3>
              <input
                onChange={this.onChangeBannersImage}
                type="file"
                name="file"
                accept="image/*"
                // multiple="multiple"
                className="form-control-file d-none"
                id="input-add-banner"
              />
              <div className="list-banners">
                {
                  banners && banners.length > 0
                  &&
                  banners.map((item, index) => {
                    return (
                      <div className="banner-item" key={index}>
                        <div className="block-avatar block-image">
                          {
                            !item.image || item.image == ""
                              ?
                              <button type="button" onClick={() => this.handleUploadImageBanner(index)}>
                                <img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
                                <span>Thêm ảnh</span>
                              </button>
                              :
                              <div className="block-image-overlay">
                                <img
                                  id="output"
                                  src={item.image}
                                  alt="your image"
                                  className="image"
                                />
                                <div className="middle">
                                  <div className="text" onClick={() => this.removeImageBanner(index)}>Xóa</div>
                                </div>
                              </div>
                          }
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Đường dẫn</label>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              name="link"
                              placeholder="Nhập đường dẫn cho hình ảnh"
                              onChange={(e) => this.onChangeValueBanner(e, index)}
                              value={item.link}
                            />
                          </div>
                        </div>
                        <div className="btn-delete-banner" onClick={() => this.deleteBannerItem(index)}>
                          <span className="mr-8">Xóa</span>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.75 4.5H2.25V6.75C3.07843 6.75 3.75 7.42157 3.75 8.25V11.25C3.75 13.3713 3.75 14.432 4.40901 15.091C5.06802 15.75 6.12868 15.75 8.25 15.75H9.75C11.8713 15.75 12.932 15.75 13.591 15.091C14.25 14.432 14.25 13.3713 14.25 11.25V8.25C14.25 7.42157 14.9216 6.75 15.75 6.75V4.5ZM7.875 8.25C7.875 7.83579 7.53921 7.5 7.125 7.5C6.71079 7.5 6.375 7.83579 6.375 8.25V12C6.375 12.4142 6.71079 12.75 7.125 12.75C7.53921 12.75 7.875 12.4142 7.875 12V8.25ZM11.625 8.25C11.625 7.83579 11.2892 7.5 10.875 7.5C10.4608 7.5 10.125 7.83579 10.125 8.25V12C10.125 12.4142 10.4608 12.75 10.875 12.75C11.2892 12.75 11.625 12.4142 11.625 12V8.25Z" fill="white" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0548 1.59092C9.73679 1.52993 9.36726 1.5 9.00033 1.5C8.6334 1.5 8.26386 1.52993 7.94589 1.59092C7.78693 1.62142 7.6313 1.66147 7.4903 1.71422C7.36224 1.76213 7.18757 1.84169 7.03979 1.97956C6.73693 2.26214 6.72049 2.73673 7.00306 3.03959C7.26971 3.32538 7.70733 3.35613 8.0103 3.12126C8.01203 3.12058 8.01391 3.11987 8.01594 3.1191C8.05596 3.10413 8.12548 3.08382 8.22848 3.06406C8.43444 3.02455 8.70685 3 9.00033 3C9.2938 3 9.56621 3.02455 9.77217 3.06406C9.87518 3.08382 9.94469 3.10413 9.98471 3.1191C9.98675 3.11987 9.98863 3.12058 9.99036 3.12126C10.2933 3.35613 10.7309 3.32538 10.9976 3.03959C11.2802 2.73673 11.2637 2.26214 10.9609 1.97956C10.8131 1.84168 10.6384 1.76213 10.5104 1.71422C10.3694 1.66146 10.2137 1.62142 10.0548 1.59092Z" fill="white" />
                          </svg>

                        </div>
                      </div>
                    )
                  })
                }
              </div>
              <div className="block-add-banner" onClick={this.handleAddBanner}>
                <img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
                <span>Thêm banner</span>
              </div>
            </div>
            <div className="block-item-content">
              <h3 className="title-block">Con số ấn tượng</h3>


              <input
                onChange={this.onChangeImageBlock1}
                type="file"
                className="form-control-file d-none"
                name="upload-image-block-1"
                id="input-img-block-1"
              />

              <div className="block-outstanding-numbers">
                {
                  outstanding_numbers && outstanding_numbers.length > 0 &&
                  outstanding_numbers.map((item, index) => {
                    return (
                      <div className="item-outstanding" key={index}>
                        <div className="block-avatar block-image">
                          {
                            !item.image || item.image.length == 0
                              ?
                              <button type="button" onClick={() => this.handleUploadImageBlock1(index)}>
                                <img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
                                <span>Thêm ảnh</span>
                              </button>
                              :
                              <div className="block-image-overlay">
                                <img
                                  id="output"
                                  src={item.image}
                                  alt="your image"
                                  className="image"
                                />
                                <div className="middle">
                                  <div className="text" onClick={() => this.remoImgBlock1(index)}>Xóa</div>
                                </div>
                              </div>
                          }
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Số</label>
                          <div>
                            <input
                              type="number"
                              className="form-control"
                              name="num"
                              onChange={(e) => this.onChangeDataOutstandingNumbers(e, index)}
                              value={item.num}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Tiêu đề</label>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              onChange={(e) => this.onChangeDataOutstandingNumbers(e, index)}
                              value={item.title}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div className="block-item-content">
              <h3 className="title-block">Thi thử</h3>


              <input
                onChange={this.onChangeImageBlock2}
                type="file"
                className="form-control-file d-none"
                name="input-image-block-2"
                id="input-img-block-2"
              />

              <div className="content input-group mb-16" style={{ alignItems: "center" }}>
                <div className="form-group mb-0 mr-16" style={{ minWidth: 350 }}>
                  <div className="text-form-label mb-8">Tiêu đề</div>
                  <input type="text" value={auditions.title} placeholder="Nhập tiêu đề" onChange={(e) => this.onChangeValueAudition(e)} className="form-control" name="title" />
                </div>
                <div className="form-group mb-0" style={{ minWidth: 450 }}>
                  <label className="text-form-label">Mô tả</label>
                  <div>
                    <textarea type="text"
                      className="form-control"
                      name="description"
                      onChange={(e) => this.onChangeValueAudition(e)}
                      value={auditions.description}></textarea>
                  </div>
                </div>
              </div>

              <div className="block-auditions">
                {
                  auditions.data && auditions.data.length > 0 &&
                  auditions.data.map((item, index) => {
                    return (
                      <div className="item-audition" key={index}>
                        <div className="block-avatar block-image">
                          {
                            !item.image || item.image.length == 0
                              ?
                              <button type="button" onClick={() => this.handleUploadImageBlock2(index)}>
                                <img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
                                <span>Thêm ảnh</span>
                              </button>
                              :
                              <div className="block-image-overlay">
                                <img
                                  id="output"
                                  src={item.image}
                                  alt="your image"
                                  className="image"
                                />
                                <div className="middle">
                                  <div className="text" onClick={() => this.remoImgBlock2(index)}>Xóa</div>
                                </div>
                              </div>
                          }
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Tiêu đề</label>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              onChange={(e) => this.onChangeDataValueAudition(e, index)}
                              value={item.title}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Mô tả</label>
                          <div>
                            <textarea type="text"
                              className="form-control"
                              name="description"
                              onChange={(e) => this.onChangeDataValueAudition(e, index)}
                              value={item.description}></textarea>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Text link</label>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              name="text_link"
                              onChange={(e) => this.onChangeDataValueAudition(e, index)}
                              value={item.text_link}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="text-form-label">Button link</label>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              name="button_link"
                              onChange={(e) => this.onChangeDataValueAudition(e, index)}
                              value={item.button_link}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div className="block-item-content">
              <h3 className="title-block">Khóa học nổi bật</h3>
              <div className="content input-group mb-16" style={{ alignItems: "center" }}>
                <div className="form-group mb-0 mr-16" style={{ minWidth: 350 }}>
                  <div className="text-form-label mb-8">Tiêu đề</div>
                  <input type="text" value={block3.title} placeholder="Nhập tiêu đề" onChange={(e) => this.onChangeValueBlock3(e)} className="form-control" name="title" />
                </div>
                <div className="form-group mb-0" style={{ minWidth: 450 }}>
                  <label className="text-form-label">Mô tả</label>
                  <div>
                    <textarea type="text"
                      className="form-control"
                      name="description"
                      onChange={(e) => this.onChangeValueBlock3(e)}
                      value={block3.description}></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="block-item-content">
              <h3 className="title-block">Sách nổi bật</h3>
              <div className="content input-group mb-16" style={{ alignItems: "center" }}>
                <div className="form-group mb-0 mr-16" style={{ minWidth: 350 }}>
                  <div className="text-form-label mb-8">Tiêu đề</div>
                  <input type="text" value={block4.title} placeholder="Nhập tiêu đề" onChange={(e) => this.onChangeValueBlock4(e)} className="form-control" name="title" />
                </div>
                <div className="form-group mb-0" style={{ minWidth: 450 }}>
                  <label className="text-form-label">Mô tả</label>
                  <div>
                    <textarea type="text"
                      className="form-control"
                      name="description"
                      onChange={(e) => this.onChangeValueBlock4(e)}
                      value={block4.description}></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="block-action-footer">
              <button type="button" className="btn-cancel">
                <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
                Hủy bỏ thay đổi
              </button>
              <button type="button" className="btn-submit ml-16" onClick={(e) => this.handleSubmit(e)}>
                Hoàn tất chỉnh sửa
                <img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
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
    bannerImage: state.file.banner_image,
    outstandingImage: state.file.outstanding_image,
    auditionImage: state.file.audition_image,
    contentConfigs: state.setting.contentConfigs,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { uploadBanner, uploadImageOutstanding, uploadImageAudition, pageUpdate, pageDetail },
    dispatch
  );
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SettingHomePage)
);
