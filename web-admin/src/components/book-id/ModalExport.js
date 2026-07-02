import React, { Component } from 'react';
import { notification } from 'antd';
import { exportTestBook, getInfoExport } from '../../redux/book-id/action';
import { exportWord } from '../../redux/examword/action'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ModalExport extends Component {
	constructor(props) {
		super();
		this.state = {
			openItems: {} // { 'groupIdx-itemIdx': true/false }
		};
	}

	componentDidMount() {
		const data = {
			book_id: this.props.match.params.id,
		};
		this.props.getInfoExport(data);
	}
	toggleItem = (key) => {
		this.setState(prev => ({
			openItems: {
				...prev.openItems,
				[key]: !prev.openItems[key]
			}
		}));
	};
	handleExportAll = async () => {
		const data = {
			book_id: this.props.match.params.id,
		};
		await this.props.exportTestBook(data);
	};
	handleExport = async (exercise, type) => {
		console.log("Exporting exercise:", exercise.code, "with type:", type);
		const data = {
			exam_id: exercise.id,
			code: exercise.code,
			export_type: type,
		};
		await this.props.exportWord(data)
	}
	render() {
		const mockGroups = this.props.infoExport || [];

		const orangeColor = '#ff8345';

		return (
			<div
				id="modal-export-data"
				className="modal-dialog modal-lg"
				style={{ maxWidth: '860px', margin: "60px auto" }}
			>
				<div
					className="modal-content"
					style={{
						borderRadius: '16px',
						background: "#fff",
						padding: "0",
						boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
						overflow: "hidden"
					}}
				>

					{/* HEADER */}
					<div style={{
						padding: "20px 24px",
						borderBottom: "1px solid #f1f1f1",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center"
					}}>
						<div style={{
							fontSize: "20px",
							fontWeight: "700",
							color: orangeColor
						}}>
							Export dữ liệu
						</div>

						<button
							data-dismiss="modal"
							style={{
								border: "none",
								background: "transparent",
								fontSize: "22px",
								opacity: 0.5,
								cursor: "pointer"
							}}
						>
							×
						</button>
					</div>

					{/* ACTION BAR */}
					<div style={{
						padding: "16px 24px",
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
						borderBottom: "1px solid #f5f5f5"
					}}>
						<button
							onClick={this.handleExportAll}
							style={{
								background: `linear-gradient(135deg, ${orangeColor}, #ff9a5c)`,
								color: "#fff",
								border: "none",
								borderRadius: "8px",
								padding: "8px 16px",
								fontWeight: 600,
								cursor: "pointer",
								boxShadow: "0 4px 12px rgba(255,131,69,0.3)"
							}}
						>
							Export tất cả danh mục
						</button>
					</div>

					{/* BODY */}
					<div style={{
						padding: "20px",
						maxHeight: "450px",
						overflowY: "auto",
						background: "#fafafa"
					}}>

						{mockGroups.map((group, groupIdx) => (
							<div key={groupIdx} style={{ marginBottom: "24px" }}>

								{/* GROUP TITLE */}
								<div style={{
									display: "flex",
									alignItems: "center",
									marginBottom: "14px"
								}}>
									<div style={{
										flex: 1,
										height: "1px",
										background: "#eee"
									}} />

									<div style={{
										padding: "6px 14px",
										borderRadius: "20px",
										background: "#fff",
										border: `1px solid ${orangeColor}`,
										color: orangeColor,
										fontWeight: 600,
										fontSize: "13px",
										margin: "0 10px"
									}}>
										{group.name}
									</div>

									<div style={{
										flex: 1,
										height: "1px",
										background: "#eee"
									}} />
								</div>

								{/* LIST ITEMS */}
								<div style={{ display: "grid", gap: "10px" }}>
									{group.items.map((item, itemIdx) => {
										const itemKey = `${groupIdx}-${itemIdx}`;
										const isItemOpen = this.state.openItems[itemKey];
										return (
											<div key={itemIdx}>

												{/* ===== ITEM ===== */}
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														padding: "12px 16px",
														borderRadius: "10px",
														background: "#fff",
														border: "1px solid #f0f0f0"
													}}
												>
													<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
														<div onClick={() => this.toggleItem(itemKey)} style={{ cursor: "pointer" }}>
															<span style={{
																transform: isItemOpen ? "rotate(90deg)" : "rotate(0deg)",
																display: "inline-block",
																transition: "0.2s",
																color: "#888"
															}}>
																❯
															</span>
														</div>

														<div style={{ fontWeight: 500 }}>{item.name}</div>
													</div>

													<div style={{ fontSize: "13px", color: "#999" }}>
														{item.count}
													</div>
												</div>

												{/* ===== CHILD ===== */}
												{isItemOpen && item.children && (
													<div style={{
														marginTop: "8px",
														marginLeft: "32px",
														display: "flex",
														flexDirection: "column",
														gap: "10px"
													}}>

														{item.children.map((child, childIdx) => {
															const childKey = `${itemKey}-${childIdx}`;
															const isChildOpen = this.state.openItems[childKey];
															return (
																<div key={childIdx}>

																	{/* CHILD HEADER */}
																	<div
																		style={{
																			display: "flex",
																			justifyContent: "space-between",
																			alignItems: "center",
																			padding: "10px 14px",
																			borderRadius: "8px",
																			background: "#fff7f2",
																			border: "1px dashed #ffd2bd"
																		}}
																	>
																		<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
																			<div onClick={() => this.toggleItem(childKey)} style={{ cursor: "pointer" }}>
																				<span style={{
																					transform: isChildOpen ? "rotate(90deg)" : "rotate(0deg)",
																					display: "inline-block",
																					transition: "0.2s",
																					fontSize: "14px",
																					color: "#999"
																				}}>
																					❯
																				</span>
																			</div>

																			<div style={{
																				fontSize: "14px",
																				fontWeight: 500,
																				color: "#444"
																			}}>
																				[{child.code}] {child.name}
																			</div>
																		</div>

																		<div style={{ fontSize: "12px", color: "#aaa" }}>
																			{child.count}
																		</div>
																	</div>

																	{/* ===== EXERCISES ===== */}
																	{isChildOpen && child.exercises && (
																		<div style={{
																			marginTop: "8px",
																			marginLeft: "28px",
																			display: "flex",
																			flexDirection: "column",
																			gap: "8px"
																		}}>

																			{child.exercises.map((ex, i) => (
																				<div
																					key={ex.id}
																					style={{
																						display: "flex",
																						justifyContent: "space-between",
																						alignItems: "center",
																						padding: "8px 12px",
																						borderRadius: "6px",
																						background: "#fff",
																						border: "1px solid #f0f0f0"
																					}}
																				>

																					{/* NAME */}
																					<div style={{
																						fontSize: "14px",
																						color: "#333"
																					}}>
																						[{ex.code}] {ex.name}
																					</div>
																					{!(ex.type === "WORD" || ex.type === "SACH_ID") && (
																						<div style={{
																							display: "flex",
																							gap: "6px"
																						}}>
																							<span style={{
																								border: "none",
																								background: "#e6f4ff",
																								color: "#ff2516",
																								fontSize: "14px",
																								padding: "3px 8px",
																								borderRadius: "10px",
																							}}>Chưa hỗ trợ đề thi này</span>
																						</div>
																					)}
																					{/* BUTTONS */}
																					{(ex.type === "WORD" || ex.type === "SACH_ID") && (
																						<div style={{
																							display: "flex",
																							gap: "6px"
																						}}>
																							<button
																								onClick={() => this.handleExport(ex, 'EXAMPLE')}
																								style={{
																									border: "none",
																									background: "#e6f4ff",
																									color: "#1677ff",
																									fontSize: "14px",
																									padding: "3px 8px",
																									borderRadius: "10px",
																									cursor: "pointer"
																								}}
																							>
																								Dạng ví dụ
																							</button>

																							<button
																								onClick={() => this.handleExport(ex, 'QUESTION')}
																								style={{
																									border: "none",
																									background: "#fff1f0",
																									color: "#ff4d4f",
																									fontSize: "14px",
																									padding: "3px 8px",
																									borderRadius: "10px",
																									cursor: "pointer"
																								}}
																							>
																								Dạng câu hỏi
																							</button>

																							<button
																								onClick={() => this.handleExport(ex, 'DETAIL')}
																								style={{
																									border: "none",
																									background: "#f6ffed",
																									color: "#52c41a",
																									fontSize: "14px",
																									padding: "3px 8px",
																									borderRadius: "10px",
																									cursor: "pointer"
																								}}
																							>
																								Dạng chi tiết
																							</button>

																						</div>
																					)}
																				</div>
																			))}

																		</div>
																	)}

																</div>
															);
														})}

													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						))}

					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		limit: state.classroom ? state.classroom.limit : 20,
		infoExport: state.bookId?.infoExport || [],
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ exportTestBook, getInfoExport, exportWord }, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ModalExport)
);
