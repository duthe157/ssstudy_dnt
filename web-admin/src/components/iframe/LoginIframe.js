import React, {Component} from 'react';
import {detailIframe, signupIframe, login, signupIframeEmail} from "../../redux/iframe/action";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {listClassroomCategory} from "../../redux/classroomgroup/action"
import {setLoader} from "../../components/LoadingContext";
import {GoogleLogin, GoogleOAuthProvider} from '@react-oauth/google';
import axios from "axios";
import $ from 'jquery'; // Import jQuery


class LoginIframe extends Component {
  constructor(props) {
    super();
    this.state = {
      messageNotice: "",
      activeTab: 'register',
      showPass: false,
      showPassCf: false,
      // userName: undefined,
      // password: undefined,
      // passwordCf: undefined,
      // email: undefined,

      loginEmail: null,
      loginPassword: null,

      errorName: null,
      errorPassword: null,
      errorPasswordCf: null,
      errorEmail: null,

      errorLoginEmail: null,
      errorLoginPassword: null,
      iframeId: null,
      iframeItem: null,
      listClassromCategory: null,
      isLogin: false,
      auth: null,
      hostWebUser: "https://www.ssstudy.vn/",
      hostWebUserNot: "https://www.ssstudy.vn",
      // hostWebUser: "http://localhost:3006/",
      // hostWebUserNot: "http://localhost:3006",
      authGoogle: {
        email: null,
      },
      showModalComfirm: false,
    };
  }

  handleTabClick = (tab) => {
    this.setState({activeTab: tab});
  }

  handleShowPass = (idShow, value) => {
    if (idShow === 'pass') {
      this.setState({showPass: !value});
    }
    if (idShow === 'passCf') {
      this.setState({showPassCf: !value});
    }
  }

  loginFunction = async () => {
    const validated = this.validateLogin()

    if (validated) {
      var {loginEmail, loginPassword} = this.state
      const requestBody = {
        email: loginEmail,
        password: loginPassword
      }
      await this.props.login(requestBody);
      await setTimeout(() => {
        this.loginSuccessToUrl()
      }, 500)
    }
  }

  loginSuccessToUrl = async () => {
    if (this.props.auth && this.props.auth.isAuthenticated === true) {
      let DifferentWindow = await window.open(this.state.hostWebUser, '_blank');
      this.setState({isLogin: true, activeTab: 'loginSuccess'})
      await this.setLocalstoreSSStudy('login', DifferentWindow)
    }
  }

  handleMessage = (event) => {
    if (event.origin === this.state.hostWebUserNot) {
      if (event.data && event.data === 'true') {
        this.setState({isLogin: true, activeTab: 'loginSuccess'})
      }
    }
  };

  setLocalstoreSSStudy = async (action, DifferentWindow) => {
    const categoryData = this.props.listClassromCategoryData
    const hostWebUser = this.state.hostWebUser
    const categoryId = categoryData[0]._id
    const classCategory = categoryData[0].category[0]._id
    var strToUrl = `${hostWebUser}khoa-hoc/${this.props.iframeItem.classroom_alias}/${categoryId}/?id=${this.props.iframeItem.classroom_id}&category_id=${classCategory}`
    let dataAuth = {}
    if (action === 'login') {
      dataAuth = this.props.auth.user
    } else if (action === 'register') {
      dataAuth = this.props.auth.user
    } else if (action === 'authen_google') {
      dataAuth = this.state.authGoogle
    }

    let dataSend = {
      user: dataAuth,
      toUrl: strToUrl
    }
    // let DifferentWindow = await window.open(hostWebUser, '_blank');
    let strMes = "'" + JSON.stringify(dataSend) + "'"

    await setTimeout(() => {
      if (DifferentWindow) {
        DifferentWindow.postMessage(strMes, hostWebUser);
      } else {
        alert('Vui lòng cho phép cửa sổ bật lên cho trang web này !');
      }
    }, 2000);
  }

  toClassTarget = () => {
    const categoryData = this.props.listClassromCategoryData
    const hostWebUser = this.state.hostWebUser
    const categoryId = categoryData[0]._id
    const classCategory = categoryData[0].category[0]._id
    var strToUrl = `${hostWebUser}/khoa-hoc/${this.props.iframeItem.classroom_alias}/${categoryId}/?id=${this.props.iframeItem.classroom_id}&category_id=${classCategory}`
    window.open(strToUrl, '_blank');
  }

  register = async () => {
    setLoader(true)
    const validate = this.validateRegister()
    if (validate) {
      var {password, userName, email} = this.state;
      const categoryData = this.props.listClassromCategoryData
      const hostWebUser = this.state.hostWebUser
      const categoryId = categoryData[0]._id
      const classCategory = categoryData[0].category[0]._id
      var strToUrl = `${hostWebUser}/khoa-hoc/${this.props.iframeItem.classroom_alias}/${categoryId}/?id=${this.props.iframeItem.classroom_id}&category_id=${classCategory}`

      const requestBody = {
        fullname: userName,
        email: email,
        password: password,
        urlRedirect: strToUrl,
        domain: this.state.hostWebUserNot
      }
      // await this.props.signupIframe(requestBody);
      await this.props.signupIframeEmail(requestBody);
      if (this.props.resRegister && this.props.resRegister.code === 200) {
        this.setState({activeTab: 'messageNotice', messageNotice: this.props.resRegister.message})
        // 	let DifferentWindow = await window.open(this.state.hostWebUser, '_blank');
        // 	await this.setLocalstoreSSStudy('register', DifferentWindow)
      }
    }
    setLoader(false)
  }

  validateLogin() {
    var validate = true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.setState({errorLoginEmail: null});
    this.setState({errorLoginPassword: null});
    var {loginEmail, loginPassword} = this.state
    if (this.isEmpty(loginEmail)) {
      this.setState({errorLoginEmail: "*Email của bạn không được trống"});
      validate = false
    }

    if (this.isEmpty(loginPassword)) {
      this.setState({errorLoginPassword: "*Password của bạn không được trống"});
      validate = false
    }
    return validate
  }

  validateRegister() {
    this.setState({errorEmail: null});
    this.setState({errorName: null});
    this.setState({errorPassword: null});
    this.setState({errorPasswordCf: null});
    this.setState({errorEmail: null});
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var validate = true
    var {userName, password, passwordCf, email} = this.state
    if (this.isEmpty(userName)) {
      this.setState({errorName: "*Tên của bạn không được trống"});
      validate = false
    }
    if (this.isEmpty(password)) {
      this.setState({errorPassword: "*Mật khẩu của bạn không được trống"});
      validate = false
    }

    if (this.isEmpty(passwordCf)) {
      this.setState({errorPasswordCf: "*Xác nhận mật khẩu không được trống"});
      validate = false
    }

    if (this.isEmpty(password) === false && this.isEmpty(passwordCf) === false && password !== passwordCf) {
      this.setState({errorPasswordCf: "*Xác nhận mật khẩu không trùng"});
      validate = false
    }

    if (this.isEmpty(email)) {
      this.setState({errorEmail: "*Email không được trống"});
      validate = false
    } else if (!emailRegex.test(email)) {
      this.setState({errorEmail: "*Email không đúng định dạng"});
      validate = false
    }
    return validate
  }

  isEmpty(value) {
    if (value === undefined || value === null || value === '') {
      return true
    }
    return false
  }

  handleChange = (e) => {
    const {name, value} = e.target;
    this.setState({[name]: value});
  }

  handleForgetPass() {

  }

  async componentDidMount() {
    window.addEventListener('message', this.handleMessage);
    const url = new URL(window.location.href);
    const iframeId = url.searchParams.get('id');
    this.setState({iframeId});

    if (iframeId) {
      await this.props.detailIframe(iframeId);
      const requstClassroom = {
        classroom_id: this.props.iframeItem.classroom_id
      }
      await this.props.listClassroomCategory(requstClassroom);
    }

    await setTimeout(() => {
      this.handleCheckLogin();
    }, 2000);
  }

  // componentWillUnmount() {
  //     window.removeEventListener('message', this.handleMessage);
  // }

  async handleCheckLogin() {
    let dataSend = {
      action: 'checkAuth'
    }
    let strMes = "'" + JSON.stringify(dataSend) + "'"
    const webBFrame = document.getElementById('webssstudy');
    webBFrame.contentWindow.postMessage(strMes, this.state.hostWebUser);
  }

  async confirmLoginGg() {
    $('#btn-open-modal-cf').click();
  }

  async loginGoogleSucess(credentialResponse, backendUrl) {
    const loginGoogleResp = await axios.post(backendUrl + "auth/google-auth", credentialResponse);
    // const loginGoogleResp = await this.props.loginGoogle(credentialResponse);
    if (loginGoogleResp.data.data.token) {
      this.setState({authGoogle: loginGoogleResp.data.data})
      this.confirmLoginGg()
    }
  }

  toUrlGoogle = async () => {
    let DifferentWindow = await window.open(this.state.hostWebUser, '_blank');
    this.setLocalstoreSSStudy('authen_google', DifferentWindow)
    this.setState({isLogin: true, activeTab: 'loginSuccess'})
    $('#btn-close-modal').click();
  }

  render() {
    const clientIdGoogle = process.env.REACT_APP_GOOGLE_CLIEN_ID
    const backendUrl = process.env.REACT_APP_BACKEND_URL
    const {activeTab, showModalComfirm} = this.state;
    const classActive = {
      background: "white",
      borderRadius: '10px 10px 0px 0px',
    }
    const classNonActive = {
      background: "#f6792d",
      color: 'white'
    }

    const styleBackGround = {
      backgroundColor: 'white',
      border: '3px solid #f6792d',
      borderRadius: '5px',
      height: '100%',
      display: 'flex'
    }

    const styleDisplayNone = {
      display: 'none'
    }
    const styleDisplay = {
      display: 'block'
    }

    const stylePanel = {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      width: '-webkit-fill-available',
    }

    var {showPass, showPassCf, userName, email} = this.state;
    var {loginEmail, loginPassword} = this.state;

    var {errorName, errorPassword, errorPasswordCf, errorEmail} = this.state;
    var {errorLoginEmail, errorLoginPassword} = this.state;

    const colorBasic = '#f6792d';


    var iframeItemProp = this.props.iframeItemProp;
    var iframeItem = undefined;
    if (iframeItemProp !== undefined && iframeItemProp.btn_content !== '') {
      iframeItem = iframeItemProp
    } else {
      iframeItem = this.props.iframeItem;
    }
    var btnContent = iframeItem ? iframeItem.btn_content : 'ĐĂNG KÝ THÀNH VIÊN NGAY \n hoàn toàn miễn phí | Hiệu quả cao'
    const hostWebUser = this.state.hostWebUser
    return (
      <div className="container" style={styleBackGround}>
        <iframe
          id="webssstudy"
          src={hostWebUser}
          style={{display: 'none'}}
          title="Web Study"
        />
        <div className="panel panel-default" style={stylePanel}>
          <div className="panel-heading mb-2">
            <h4 className="panel-title row" style={{
              backgroundColor: '#f6792d'
            }}>
							<span
                className={`col-6 tab p-3 font-weight-bold`}
                onClick={() => this.handleTabClick('register')}
                style={{
                  cursor: 'pointer',
                  textAlign: "center",
                  ...(activeTab === 'register' ? classActive : classNonActive)
                }}
              >
								ĐĂNG KÝ
							</span>
              <span
                className={`col-6 tab p-3 font-weight-bold`}
                onClick={() => this.handleTabClick('login')}
                style={{
                  cursor: 'pointer',
                  textAlign: "center",
                  ...(activeTab === 'login' ? classActive : classNonActive)
                }}

              >
								ĐĂNG NHẬP
							</span>
            </h4>
          </div>
          <div className="panel-body d-flex h-100" style={{flexDirection: 'column'}}>
            {activeTab === 'register' && (
              <div className='h-100 d-flex flex-column'>
                <label className='font-weight-bold'>Tên</label>
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Họ và tên của bạn"
                         onChange={this.handleChange}
                         name="userName"
                    // value={userName}
                  />
                  <small className="text-danger" style={errorName ? styleDisplay : styleDisplayNone}>
                    {errorName}
                  </small>
                </div>
                <div className="form-group">
                  <label className='font-weight-bold'>Email</label>

                  <input
                    onChange={this.handleChange}
                    name='email'
                    // value={email}
                    type="email" className="form-control" placeholder="Địa chỉ email của bạn"/>
                  <small className="text-danger" style={errorEmail ? styleDisplay : styleDisplayNone}>
                    {errorEmail}
                  </small>
                </div>
                <div className="form-group">
                  <div className="row">
                    <div className="col-6">
                      <label className='font-weight-bold'>Mật khẩu</label>
                    </div>
                    <div className="col-6">
                      <label className='font-weight-bold'>Xác nhận mật khẩu</label>
                    </div>
                    <div className="col-6">
                      <div className="input-group">
                        <input className="form-control" id="password" name="password"
                               onChange={this.handleChange}
                               placeholder="Mật khẩu" type={`${showPass ? "text" : "password"}`}/>
                        <span className="input-group-text"
                              onClick={() => this.handleShowPass('pass', showPass)}
                        >
													<i className={`${showPass ? "fa-eye" : "fa-eye-slash"} far`}
                             id="togglePassword"></i></span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="input-group">
                        <input className="form-control" id="passwordCf" name="passwordCf"
                               onChange={this.handleChange}
                               placeholder="Xác nhận mật khẩu" type={`${showPassCf ? "text" : "password"}`}/>
                        <span className="input-group-text"
                              onClick={() => this.handleShowPass('passCf', showPassCf)}
                        >
													<i className={`${showPassCf ? "fa-eye" : "fa-eye-slash"} far`}
                             id="togglePasswordCf"></i></span>
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-6'>
                      <small className="text-danger" style={errorPassword ? styleDisplay : styleDisplayNone}>
                        {errorPassword}
                      </small>
                    </div>
                    <div className='col-6'>
                      <small className="text-danger" style={errorPasswordCf ? styleDisplay : styleDisplayNone}>
                        {errorPasswordCf}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="align-items-center m-2 flex-grow-1"
                     style={{with: '100%', display: 'flex', justifyContent: 'center'}}>
                  <GoogleOAuthProvider clientId={clientIdGoogle}>
                    <GoogleLogin
                      onSuccess={credentialResponse => {
                        this.loginGoogleSucess(credentialResponse, backendUrl)
                      }}
                      onError={() => {
                        console.log("Login Failed");
                      }}
                    />
                  </GoogleOAuthProvider>
                </div>
                <button type="button" className="btn btn-primary btn-block mb-2"
                  // style={{ whiteSpace: 'pre-line', bottom: '0px', position:'absolute'}}
                        style={{whiteSpace: 'pre-line'}}
                        onClick={this.register}>
                  {btnContent}
                </button>
              </div>
            )}
            {activeTab === 'login' && (
              <div>
                <div className="form-group">
                  <label className='font-weight-bold'>Email</label>
                  <input
                    onChange={this.handleChange}
                    name='loginEmail'
                    value={loginEmail}
                    type="email" className="form-control" placeholder="Email"/>
                  <small className="text-danger" style={errorLoginEmail ? styleDisplay : styleDisplayNone}>
                    {errorLoginEmail}
                  </small>
                </div>
                <div className="form-group">
                  <label className='font-weight-bold'>Mật khẩu</label>
                  <input
                    onChange={this.handleChange}
                    name='loginPassword'
                    value={loginPassword}
                    type="password" className="form-control" placeholder="Mật khẩu"/>
                  <small className="text-danger" style={errorLoginPassword ? styleDisplay : styleDisplayNone}>
                    {errorLoginPassword}
                  </small>
                </div>
                <a className='p-2' style={{color: colorBasic}}
                   onClick={() => this.handleTabClick('forget')}
                >Quên mật khẩu ?</a>
                <div className="align-items-center m-2"
                     style={{with: '100%', display: 'flex', justifyContent: 'center'}}>
                  <GoogleOAuthProvider clientId={clientIdGoogle}>
                    <GoogleLogin
                      onSuccess={credentialResponse => {
                        this.loginGoogleSucess(credentialResponse, backendUrl)
                      }}
                      onError={() => {
                        console.log("Login Failed");
                      }}
                    />
                  </GoogleOAuthProvider>
                </div>

                <button type="button" className="btn btn-primary btn-block mb-2"
                        onClick={this.loginFunction}
                >ĐĂNG NHẬP
                </button>
              </div>
            )}
            {activeTab === 'forget' && (
              <div>
                <div className="form-group">
                  <label className='font-weight-bold'>Email</label>
                  <input type="email" className="form-control" placeholder="Email"/>
                  <label className='font-weight-bold'>Mã kích hoạt</label>
                  <input type="text" className="form-control" placeholder="Mã kích hoạt"/>
                  {/* <small className="text-danger" style={errorEmail? styleDisplay : styleDisplayNone}>
										{errorEmail}
									</small> */}
                </div>
                {/* <a className='p-2' style={{
									color: colorBasic
								}}
									onClick={() => this.handleTabClick('login')}
								>Quay lại đăng nhập ?</a> */}
                <button type="button" className="btn btn-primary btn-block mb-2"
                  // onClick={this.login}
                >Nhận mã kích hoạt
                </button>
              </div>
            )}
            {activeTab === 'loginSuccess' && (
              <div>
                <img src='/assets/img/image-login-success.png' className='mr-10' alt=''/>
                <label className='font-weight-bold'>Bạn đã đăng nhập</label>
                <button type="button" className="btn btn-primary btn-block mb-2"
                        onClick={this.toClassTarget}
                >Click để học ngay
                </button>
              </div>
            )}
            {activeTab === 'messageNotice' && (
              <div>
                <img src='/assets/img/image-login-success.png' className='mr-10' alt=''/>
                <label className='font-weight-bold'>{this.state.messageNotice}</label>
              </div>
            )}
          </div>
        </div>

        <div className="modal fade" id="myModalCfLogin" role="dialog">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Thông báo</h4>
                <button id="btn-close-modal" type="button" className="close" data-dismiss="modal">&times;</button>
              </div>
              <div className="modal-body">
                <p>Bạn đã đăng nhập thành công bằng email {this.state.authGoogle.email}</p>
                <button type="button" className="btn btn-primary btn-block mb-2" onClick={this.toUrlGoogle}
                >Click để học ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        <button style={{display: "none"}} id="btn-open-modal-cf" type="button" className="btn btn-info btn-lg"
                data-toggle="modal" data-target="#myModalCfLogin">Open Small
          Modal
        </button>

      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    iframeItem: state.iframe.iframeItem,
    listClassromCategoryData: state.classroomGroup.listClassromCategory,
    auth: state.iframe.auth,
    resRegister: state.iframe.authSignUpEmail
    // authSignUp: state.iframe.userSignUp
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({detailIframe, login, signupIframe, listClassroomCategory, signupIframeEmail}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginIframe);