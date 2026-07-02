import React, { Component } from 'react';

export default class Dashboard extends Component {
	constructor(props) {
		super();
	}

	componentDidMount() {
		this.props.history.push('/classroom');
	}
	render() {
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">
								Welcome
							</h2>
							<small className="text-muted"></small>
						</div>
						<div className="flex" />
						<div>
							<a href="/" className="btn btn-md text-muted">
								<span className="d-none d-sm-inline mx-1">
									Lưu
								</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width={16}
									height={16}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
									className="feather feather-arrow-right">
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</a>
						</div>
					</div>
				</div>
				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số học sinh
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>

							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số lớp
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>

							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số video
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>

							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số câu hỏi
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>
						</div>

						<div className="row d-flex justify-content-center">
							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số đề thi
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>

							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số bài thi
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>

							<div className="col-3">
								<div
									className="card"
									data-sr-id={6}
									style={{
										visibility: 'visible',
										transform: 'none',
										opacity: 1,
										transition: 'none 0s ease 0s',
									}}>
									<div className="card-body">
										<div className="d-md-flex">
											<div className="flex">
												<div
													className="text-highlight"
													style={{ height: 30 }}></div>
												<small className="">
													Tổng số tài liệu
												</small>
											</div>
											<div className="flex text-center">
												<div
													className="text-highlight"
													style={{ height: 20 }}></div>
												<small
													className=""
													style={{ fontSize: 25 }}>
													20
												</small>
											</div>
										</div>
										<div
											className="w-50"
											style={{ height: '30px' }}></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
