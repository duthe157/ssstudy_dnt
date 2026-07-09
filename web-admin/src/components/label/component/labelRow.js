import React, { Component } from "react";
import { Link } from "react-router-dom";
import { AiFillCaretRight, AiFillCaretDown  } from "react-icons/ai";
import { Droppable, Draggable } from 'react-beautiful-dnd';


// ─── Format ngày ─────────────────────────────────────────────────────────────
function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

class LabelRow extends Component {
    render() {
        const { tag, level = 0, expandedIds, onToggle, viewMode, onDelete, openRenameSectionModal, restoreLabel, showLabel, hideLabel } = this.props;
        const tagId = tag._id || tag.id;
        const children = tag.children || [];
        const isExpanded = expandedIds.has(tagId) || expandedIds.has(tag.id);
        const hasChildren = tag.has_children || children.length > 0;
        const indent = level * 24; 

        return (
            <React.Fragment key={tagId}>
                <tbody>
                <tr style={{ backgroundColor: level > 0 ? '#f9fafb' : 'transparent' }}>
                    <td>
                        <div className="d-flex align-items-center"
                            style={{ paddingLeft: indent }}>
                            {hasChildren ? (
                                <button
                                    type="button"
                                    className="btn btn-icon btn-sm p-0 mr-1"
                                    style={{ width: 20, height: 20, flexShrink: 0 }}
                                    onClick={() => onToggle(tagId)}
                                    title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                                >
                                    {isExpanded ? <AiFillCaretDown /> : <AiFillCaretRight  />}
                                </button>
                            ) : (
                                <span style={{ width: 20, display: 'inline-block', flexShrink: 0 }} />
                            )}
                            <Link
                                 to={{
                                    pathname: `/label/assign/${tagId}`,
                                    state: { labelName: tag.name }
                                }}
                                className={level === 0 ? 'font-weight-bold' : 'text-muted'}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                {tag.name}
                            </Link>
                            {level === 0 && hasChildren && (
                                <span className="badge badge-pill badge-light ml-2"
                                    style={{ fontSize: 11 }}>
                                    {children.length} con
                                </span>
                            )}
                        </div>
                    </td>

                    {/* Số lượng gán */}
                    <td>{tag.num_item}</td>

                    {/* Cập nhật */}
                    <td>{formatDate(tag.updated_at)}</td>

                    {/* Thao tác */}
                    <td className="text-right">
                        {viewMode === 'all' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-icon mr-2"
                                    title="Đổi tên"
                                    data-toggle="modal"
                                    data-target="#rename-section-modal"
                                    onClick={() => openRenameSectionModal(tagId, tag.name, tag.parent_id)}
                                >
                                    <img src="/assets/img/icon-edit.svg" alt="rename" />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-icon mr-2"
                                    title="Ẩn"
                                    onClick={() => hideLabel(tagId)}
                                >
                                    <img src="/assets/img/icon-eye-off.svg" alt="hide" />
                                </button>
                            </>
                        )}
                        {viewMode === 'hidden' && (
                            <button
                                type="button"
                                className="btn btn-icon mr-2"
                                title="Hiện"
                                onClick={() => showLabel(tagId)}
                            >
                                <img src="/assets/img/icon-eye.svg" alt="unhide" />
                            </button>
                        )}
                        {viewMode !== 'deleted' && (
                            <button
                                type="button"
                                className="btn btn-icon text-danger"
                                title="Xóa"
                                data-toggle="modal"
                                data-target="#delete-section-modal"
                                onClick={() => onDelete(tagId)}
                            >
                                <img src="/assets/img/icon-delete.svg" alt="delete" />
                            </button>
                        )}
                        {viewMode === 'deleted' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-icon mr-2"
                                    title="Khôi phục"
                                    onClick={() => restoreLabel(tagId)}
                                >
                                    <img src="/assets/img/icon-reload.svg" alt="restore" />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-icon text-danger"
                                    title="Xóa vĩnh viễn"
                                    data-toggle="modal"
                                    data-target="#delete-section-modal"
                                    onClick={() => onDelete(tagId, 'purge')}
                                >
                                    <img src="/assets/img/icon-delete.svg" alt="purge" />
                                </button>
                            </>
                        )}
                    </td>
                </tr>
                </tbody>

                {/* Render children nếu đang mở và có dữ liệu; children are draggable */}
                {isExpanded && hasChildren && (
                <Droppable droppableId={`children-${tagId}`}>
                    {(provided) => (
                        <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {children.map((child, index) => {
                                const childId = child._id || child.id;

                                return (
                                    <Draggable key={childId} draggableId={String(childId)} index={index}>
                                        {(prov, snapshot) => (
                                            <tr
                                                ref={prov.innerRef}
                                                {...prov.draggableProps}
                                                style={{
                                                    backgroundColor: '#f9fafb',
                                                    ...(snapshot.isDragging ? { display: 'table', width: '100%' } : {}),
                                                    ...(prov.draggableProps.style || {})
                                                }}
                                            >
                                                <td>
                                                    <div className="d-flex align-items-center" style={{ paddingLeft: (level + 1) * 24 }}>
                                                        <span
                                                            {...prov.dragHandleProps}
                                                            title="Kéo để đổi thứ tự"
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, marginRight: 8, cursor: 'grab' }}
                                                        >
                                                            <img src="/assets/img/icon-move.svg" alt="" />
                                                        </span>
                                                        <Link
                                                            to={{
                                                                pathname: `/label/assign/${childId}`,
                                                                state: { labelName: child.name }
                                                            }}
                                                            className={level === 0 ? 'font-weight-bold' : 'text-muted'}
                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td>{child.num_item}</td>
                                                <td>{formatDate(child.updated_at)}</td>
                                                <td className="text-right">
                                                    {viewMode === 'all' && (
                                                        <>
                                                            <button type="button" className="btn btn-icon mr-2" title="Đổi tên" data-toggle="modal" data-target="#rename-section-modal" onClick={() => { openRenameSectionModal(childId, child.name, child.parent_id) }}>
                                                                <img src="/assets/img/icon-edit.svg" alt="rename" />
                                                            </button>
                                                            <button type="button" className="btn btn-icon mr-2" title="Ẩn" onClick={() => hideLabel(childId)}>
                                                                <img src="/assets/img/icon-eye-off.svg" alt="hide" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {viewMode === 'hidden' && (
                                                        <button type="button" className="btn btn-icon mr-2" title="Hiện" onClick={() => showLabel(childId)}>
                                                            <img src="/assets/img/icon-eye.svg" alt="unhide" />
                                                        </button>
                                                    )}
                                                    {viewMode !== 'deleted' && (
                                                        <button type="button" className="btn btn-icon text-danger" title="Xóa" data-toggle="modal" data-target="#delete-section-modal" onClick={() => onDelete(childId)}>
                                                            <img src="/assets/img/icon-delete.svg" alt="delete" />
                                                        </button>
                                                    )}
                                                    {viewMode === 'deleted' && (
                                                        <>
                                                            <button type="button" className="btn btn-icon mr-2" title="Khôi phục" onClick={() => restoreLabel(childId)}>
                                                                <img src="/assets/img/icon-reload.svg" alt="restore" />
                                                            </button>
                                                            <button type="button" className="btn btn-icon text-danger" title="Xóa vĩnh viễn" data-toggle="modal" data-target="#delete-section-modal" onClick={() => onDelete(childId, 'purge')}>
                                                                <img src="/assets/img/icon-delete.svg" alt="purge" />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </tbody>
                    )}
                </Droppable>
            )}
            </React.Fragment>
        );
    }
}

export default LabelRow;