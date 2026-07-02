import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { listSubject } from "../../redux/subject/action";
import { notification } from "antd";
import $, { type } from 'jquery'; // Import jQuery
import { max } from "lodash";

class ModalGroupQuestion extends Component {
  state = {
    name: "",
    subjectData: [],
    minNumber: 0,
    actionGroup: this.props.actionGroup || "create",
    groupDetail: this.props.groupDetail || null,
    createdGroups: [],
    subject: "",  //dropdown chon nhieu hoạc 1 mon
    maxGroup: 1,  //số nhóm tối đa
    dataGroupQuestion: null,
    topicGroups: [
      {
        idTopic: 1,
        nameTopic: "",
        maxTopics: 1,
        maxSubjects: 3,
        subjects: [{
          idSubject: "sub_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
          nameSubject: "",
        }]
      }
    ]
  };

  clearAllInputs = () => {
    this.setState({
      name: "",
      // Reset subjectData từ props, uncheck tất cả
      subjectData: this.props.subjects ? this.props.subjects.map((s) => ({ ...s, checked: false })) : [],
      minNumber: 0,
      actionGroup: "create", // ✅ SỬA: Luôn reset về "create"
      groupDetail: null, // ✅ SỬA: Reset groupDetail về null
      createdGroups: [],
      subject: "",
      maxGroup: 1,
      topicGroups: [
        {
          idTopic: 1,
          nameTopic: "",
          type: "single", // Đảm bảo type mặc định
          maxTopics: 1,
          maxSubjects: 3,
          subjects: [{
            idSubject: "sub_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
            nameSubject: "", // Đảm bảo reset nameSubject về rỗng
          }]
        }
      ],
      dataGroupQuestion: null // ✅ THÊM: Reset dataGroupQuestion
    }, () => {
      // Sau khi state đã được cập nhật, reset tất cả select về giá trị mặc định
      const selects = document.querySelectorAll('select[value=""]');
      selects.forEach(select => {
        select.value = "";
      });
    });
  };

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    this.subjectData = await this.props.listSubject(data);

    // ✅ THÊM: Xử lý dữ liệu ban đầu nếu có
    if (
      this.props.dataItemGroup &&
      this.props.dataItemGroup.groups &&
      Array.isArray(this.props.dataItemGroup.groups) &&
      this.props.dataItemGroup.groups.length > 0
    ) {
      this.updateSubjectData(this.props.dataItemGroup);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.dataItemGroup &&
      this.props.dataItemGroup.groups &&
      JSON.stringify(prevProps.dataItemGroup) !== JSON.stringify(this.props.dataItemGroup)
    ) {
      console.log("Data update trả ve: ", JSON.stringify(this.props.dataItemGroup, null, 2));
      this.updateSubjectData(this.props.dataItemGroup);
      return;
    }
    // ✅ Reset khi uniqueKey thay đổi (chuyển phần thi)
    if (prevProps.uniqueKey !== this.props.uniqueKey) {
      this.clearAllInputs();
      return;
    }

    // ✅ Reset khi chuyển sang chế độ create mà không có dữ liệu
    if (
      prevProps.actionGroup !== this.props.actionGroup &&
      this.props.actionGroup === "create" &&
      !this.props.groupDetail &&
      !this.props.dataItemGroup
    ) {
      this.clearAllInputs();
    }
  }

  updateSubjectData = (dataItemGroup) => {
    console.log("Data truyen ve: ", JSON.stringify(dataItemGroup, null, 2));
    // ✅ Kiểm tra dataItemGroup có đúng format không
    if (!dataItemGroup || !dataItemGroup.groups || !Array.isArray(dataItemGroup.groups)) {
      return;
    }

    // ✅ THÊM: Kiểm tra xem data có thay đổi thực sự không
    const currentDataString = JSON.stringify(this.state.dataGroupQuestion);
    const newDataString = JSON.stringify(dataItemGroup);

    if (currentDataString === newDataString) {
      return;
    }

    try {
      // ✅ Chuyển đổi từ dataItemGroup.groups sang topicGroups format
      const convertedTopicGroups = dataItemGroup.groups.map((group, index) => ({
        idTopic: group.id || `topic_${Date.now()}_${index}`,
        nameTopic: group.name || "",
        type: group.subjects && group.subjects.length > 1 ? "multiple" : "single",
        maxSubjects: group.maxSubjects,
        maxTopics: group.maxTopics,
        subjects: (group.subjects || []).map(subject => ({
          idSubject: subject.id || `sub_${Date.now()}_${Math.random()}`,
          nameSubject: subject.name || "",
          questions: subject.questions || [] // ✅ Giữ lại questions data
        }))
      }));

      // ✅ SỬA: Lấy maxTopics từ dataItemGroup thay vì biến maxGroup không tồn tại
      const dataMaxTopic = dataItemGroup.maxTopics || 1;

      // ✅ SỬA: Cập nhật cả actionGroup thành "update" khi load dữ liệu có sẵn
      this.setState({
        topicGroups: convertedTopicGroups,
        maxGroup: dataMaxTopic, // ✅ SỬA: Sử dụng dataMaxTopic thay vì maxGroup
        dataGroupQuestion: dataItemGroup,
        actionGroup: "update" // ✅ THÊM: Đặt chế độ update khi có dữ liệu
      });

    } catch (error) {
      // ✅ SỬA: Sử dụng this.showNotification thay vì gọi trực tiếp
      if (this.showNotification) {
        this.showNotification("error", "Lỗi khi xử lý dữ liệu nhóm chủ đề");
      }
    }
  };

  handleGroupDetailUpdate = (
    groupDetail,
    subjects = this.state.subjectData
  ) => {
    if (groupDetail && Array.isArray(subjects)) {
      const updatedSubjects = subjects.map((obj) => ({
        ...obj,
        checked: groupDetail.subjects.some(
          (s) => s.id === obj._id || s.subject_id === obj._id
        ),
      }));

      this.setState({
        name: groupDetail.name || groupDetail.exam_section_group_name || "",
        minNumber:
          groupDetail.minNumber || groupDetail.number_subject_require || 0,
        subjectData: updatedSubjects,
        groupDetail,
        actionGroup: "update",
      });
    }
  };

  showNotification = (type, message) => {
    notification[type]({
      message,
      placement: "topRight",
      duration: 3,
    });
  };

  validateCreate = () => {
    const { topicGroups, maxGroup } = this.state;

    // 1. Kiểm tra số nhóm tối đa
    if (!maxGroup || maxGroup < 1) {
      this.showNotification("error", "Vui lòng tạo nhóm chủ đề");
      return false;
    }

    // 2. Kiểm tra tên nhóm
    if (topicGroups.some((g) => !(g.nameTopic || "").trim())) {
      this.showNotification("error", "Vui lòng nhập tên nhóm");
      return false;
    }

    // 3. Kiểm tra phân loại nhóm
    if (topicGroups.some((g) => !(g.type || "").trim())) {
      this.showNotification("error", "Vui lòng phân loại nhóm chủ đề");
      return false;
    }

    // 4. Kiểm tra môn học
    if (
      topicGroups.some(
        (g) =>
          !g.subjects.length || // chưa có môn nào
          g.subjects.some(
            (s) => !(s.nameSubject || "").trim() // chưa chọn tên môn
          )
      )
    ) {
      this.showNotification("error", "Vui lòng chọn ít nhất một môn học cho nhóm");
      return false;
    }

    return true;
  };

  validateCreate = () => {
    const { topicGroups, maxGroup } = this.state;

    // 1. Kiểm tra số nhóm tối đa
    if (!maxGroup || maxGroup < 1) {
      this.showNotification("error", "Vui lòng tạo nhóm chủ đề");
      return false;
    }

    // 2. Kiểm tra tên nhóm
    if (topicGroups.some((g) => !(g.nameTopic || "").trim())) {
      this.showNotification("error", "Vui lòng nhập tên nhóm");
      return false;
    }

    // 2.1. Kiểm tra tên nhóm trùng lặp
    const groupNames = topicGroups.map(g => g.nameTopic?.trim().toLowerCase()).filter(name => name);
    const uniqueNames = [...new Set(groupNames)];

    if (groupNames.length !== uniqueNames.length) {
      this.showNotification("error", "Không được đặt tên nhóm chủ đề trùng nhau!");
      return false;
    }

    // 3. Kiểm tra phân loại nhóm
    if (topicGroups.some((g) => !(g.type || "").trim())) {
      this.showNotification("error", "Vui lòng phân loại nhóm chủ đề");
      return false;
    }

    // ✅ 4. THÊM: Kiểm tra mỗi nhóm phải có đúng 5 môn học
    const invalidGroups = [];
    topicGroups.forEach((group, groupIdx) => {
      const subjects = group.subjects || [];

      // Kiểm tra số lượng môn học
      if (subjects.length !== 5) {
        invalidGroups.push(`"${group.nameTopic || `Nhóm ${groupIdx + 1}`}" có ${subjects.length}/5 môn học`);
        return;
      }

      // Kiểm tra mỗi môn học phải có nameSubject khác null
      const emptySubjects = subjects.filter((s, sIdx) => !s.nameSubject || s.nameSubject.trim() === "");
      if (emptySubjects.length > 0) {
        invalidGroups.push(`"${group.nameTopic || `Nhóm ${groupIdx + 1}`}" có ${emptySubjects.length} môn học chưa được chọn`);
      }
    });

    if (invalidGroups.length > 0) {
      this.showNotification("error", `Các lỗi sau cần được sửa: ${invalidGroups.join(", ")}`);
      return false;
    }

    return true;
  };

  // ...existing code...
  createOrUpdateGroup = async () => {
    const { topicGroups, actionGroup, maxGroup } = this.state;

    // ✅ THÊM: Pre-validation dựa trên type của nhóm
    const preValidationErrors = [];

    topicGroups.forEach((group, idx) => {
      const subjects = group.subjects || [];
      const groupType = group.type || "";
      const groupName = group.nameTopic || `Nhóm ${idx + 1}`;

      // ✅ Kiểm tra type có được chọn không
      if (!groupType) {
        preValidationErrors.push(`"${groupName}" chưa chọn loại nhóm (Một môn/Nhiều môn)`);
        return;
      }

      // ✅ Kiểm tra số lượng môn theo type
      if (groupType === "single") {
        // Type single: chỉ được có 1 môn
        if (subjects.length !== 1) {
          preValidationErrors.push(`"${groupName}" (Một môn) phải có đúng 1 môn học (hiện có ${subjects.length})`);
        }
      } else if (groupType === "multiple") {
        // Type multiple: bắt buộc có 5 môn
        if (subjects.length !== 5) {
          preValidationErrors.push(`"${groupName}" (Nhiều môn) phải có đúng 5 môn học (hiện có ${subjects.length})`);
        }
      }

      // ✅ Kiểm tra các môn học đã được chọn chưa
      const emptySubjects = subjects.filter(s => !s.nameSubject || s.nameSubject.trim() === "");
      if (emptySubjects.length > 0) {
        preValidationErrors.push(`"${groupName}" có ${emptySubjects.length} môn học chưa được chọn`);
      }
    });

    if (preValidationErrors.length > 0) {
      this.showNotification("error", `Lỗi validation: ${preValidationErrors.join(", ")}`);
      return;
    }

    if (!this.validateCreate()) return;

    try {
      // ✅ THÊM: Duyệt qua topicGroups và cập nhật maxTopics = maxGroup
      const updatedTopicGroups = topicGroups.map(group => ({
        ...group,
        maxTopics: maxGroup,
        // ✅ Cập nhật maxSubjects dựa trên type
        maxSubjects: group.type === "single" ? 1 : 3
      }));

      console.log("Data sau khi cập nhật maxTopics:", JSON.stringify(updatedTopicGroups, null, 2));

      if (actionGroup === "update") {
        console.log("Data topic group: ", JSON.stringify(updatedTopicGroups, null, 2));
        await this.props.updateGroupQuestion(updatedTopicGroups);
      } else {
        await this.props.createGroupQuestion(updatedTopicGroups);
      }

      // ✅ SỬA: Hiển thị thông báo và đóng modal
      this.showNotification(
        "success",
        actionGroup === "update" ? "Cập nhật nhóm chủ đề thành công!" : "Tạo nhóm chủ đề thành công!"
      );

      // ✅ SỬA: Reset form và đóng modal
      this.resetForm();
      this.closeModal();

    } catch (error) {
      console.error('Error creating/updating group:', error);
      this.showNotification("error", "Có lỗi xảy ra khi lưu nhóm chủ đề!");
    }
  };

  UpdateGroupModal = (groupDetail) => {
    // Cập nhật state để modal biết đang ở chế độ "update"
    this.setState({
      actionGroup: "update",
      groupDetail,
      name: groupDetail.name || "",
      minNumber: groupDetail.minNumber || 0,
      subjectData: this.state.subjectData.map((s) => ({
        ...s,
        checked: groupDetail.subjects.some((sub) => sub.id === s._id),
      })),
    });
  };

  resetForm = () => {
    this.setState({
      name: "",
      minNumber: 0,
      subjectData: this.state.subjectData.map((s) => ({
        ...s,
        checked: false,
      })),
      groupDetail: null,
    });
  };

  fetchRowsSubject = (group, currentIdx) => {
    if (!Array.isArray(this.props.subjects)) return null;


    return this.props.subjects.map((obj) => {
      const isSelectedElsewhere = group.subjects.some(
        (s, i) =>
          i !== currentIdx &&
          (s.idSubject === obj._id || s.nameSubject === obj.name)
      );

      return (
        <option
          key={obj._id}
          value={`${obj._id}|${obj.name.toUpperCase()}`}
          disabled={isSelectedElsewhere}
        >
          {isSelectedElsewhere
            ? `${obj.name.toUpperCase()} (ĐÃ CHỌN)`
            : obj.name.toUpperCase()}
        </option>
      );
    });
  };

  addGroup = () => {
    this.setState((prev) => {
      const uniqueId = "topic_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

      // ✅ Logic thống nhất cho cả create và update
      const newGroup = {
        idTopic: uniqueId,
        nameTopic: "",
        type: "single",
        maxTopics: prev.topicGroups[0]?.maxTopics || prev.maxGroup || 1,
        maxSubjects: 1,
        subjects: [{
          idSubject: "sub_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
          nameSubject: "",
          questions: []
        }]
      };

      const newTopicGroups = [...prev.topicGroups, newGroup];

      // ✅ Cập nhật maxGroup cho cả 2 chế độ nếu cần
      const updatedState = {
        topicGroups: newTopicGroups
      };

      // Chỉ cập nhật maxGroup trong create mode
      if (this.state.actionGroup === "create") {
        updatedState.maxGroup = newTopicGroups.length;
      }

      return updatedState;
    }, () => {
      // ✅ Callback sau khi thêm nhóm thành công
      const { actionGroup, topicGroups } = this.state;
      if (actionGroup === "create") {
        this.showNotification("success", `Đã thêm nhóm ${topicGroups.length}. Tổng: ${topicGroups.length}/${this.state.maxGroup}`);
      } else {
        this.showNotification("success", `Đã thêm nhóm ${topicGroups.length} vào danh sách`);
      }

      // ✅ Cập nhật dataGroupQuestion sau khi thêm
      this.updateDataGroupQuestion();

    });
  };

  removeGroup = (idx) => {
    // ✅ THÊM: Validation cơ bản
    if (idx < 0 || idx >= this.state.topicGroups.length) {
      console.warn('[removeGroup] Index không hợp lệ:', idx);
      return;
    }

    // ✅ THÊM: Kiểm tra số nhóm tối thiểu
    if (this.state.topicGroups.length <= 1) {
      this.showNotification("warning", "Phải có ít nhất một nhóm chủ đề");
      return;
    }

    // ✅ THÊM: Lấy thông tin nhóm sẽ bị xóa để thông báo
    const groupToDelete = this.state.topicGroups[idx];
    const groupName = groupToDelete?.nameTopic || `Nhóm ${idx + 1}`;
    const subjectCount = groupToDelete?.subjects?.length || 0;

    // ✅ THÊM: Xác nhận trước khi xóa
    const confirmMessage = subjectCount > 0
      ? `Bạn có chắc chắn muốn xóa "${groupName}" với ${subjectCount} môn học không?`
      : `Bạn có chắc chắn muốn xóa "${groupName}" không?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.setState((prev) => {
      // ✅ THÊM: Kiểm tra lại trong setState để đảm bảo an toàn
      if (prev.topicGroups.length <= 1) {
        console.warn('[removeGroup] Không thể xóa nhóm cuối cùng');
        return null; // Không thay đổi state
      }

      const newTopicGroups = prev.topicGroups.filter((_, i) => i !== idx);
      const newMaxGroup = Math.max(1, prev.maxGroup - 1); // ✅ Đảm bảo maxGroup >= 1

      // ✅ THÊM: Cập nhật lại ID và số thứ tự cho các nhóm còn lại
      const reindexedGroups = newTopicGroups.map((group, newIdx) => ({
        ...group,
        // Có thể cập nhật lại idTopic nếu cần
        // idTopic: `topic_${Date.now()}_${newIdx}`
      }));

      return {
        topicGroups: reindexedGroups,
        maxGroup: newMaxGroup
      };
    }, () => {
      // ✅ THÊM: Callback sau khi setState hoàn thành

      // Hiển thị thông báo thành công
      this.showNotification("success", `Đã xóa "${groupName}" thành công`);

      // ✅ THÊM: Cập nhật maxTopics cho tất cả nhóm còn lại nếu cần
      const currentMaxTopics = this.state.topicGroups[0]?.maxTopics;
      if (currentMaxTopics && currentMaxTopics > this.state.maxGroup) {
        this.updateMaxTopics(this.state.maxGroup);
      }

      // ✅ THÊM: Log trạng thái sau khi xóa
      console.log('[removeGroup] Trạng thái sau khi xóa:', {
        remainingGroups: this.state.topicGroups.length,
        maxGroup: this.state.maxGroup
      });
    });
  };

  // ✅ THÊM: Method kiểm tra tên nhóm trùng lặp
  // ✅ SỬA: Tối ưu method checkDuplicateTopicName
  checkDuplicateTopicName = (currentIdx, newName) => {
    const { topicGroups } = this.state;

    // ✅ THÊM: Kiểm tra input validation trước
    if (!newName || typeof newName !== 'string') {
      return false;
    }

    const trimmedName = newName.trim().toLowerCase();

    // ✅ THÊM: Nếu tên rỗng thì không cần kiểm tra trùng
    if (!trimmedName) {
      return false;
    }

    // Kiểm tra tên có trùng với nhóm khác không (loại trừ chính nó)
    const isDuplicate = topicGroups.some((group, idx) => {
      return idx !== currentIdx &&
        group.nameTopic &&
        group.nameTopic.trim().toLowerCase() === trimmedName;
    });

    return isDuplicate;
  };

  // ✅ SỬA: Loại bỏ debugger và tối ưu handleGroupChange
  handleGroupChange = (idx, field, value) => {
    // ✅ XÓA: debugger; - Gây treo trình duyệt

    // ✅ SỬA: Chỉ hiển thị warning mà không block việc nhập
    if (field === "nameTopic") {
      const trimmedValue = value.trim();

      // ✅ SỬA: Chỉ kiểm tra khi có giá trị và đã nhập xong (có thể dùng debounce)
      if (trimmedValue && this.checkDuplicateTopicName(idx, trimmedValue)) {
        // ✅ SỬA: Không return, vẫn cho phép nhập
        console.warn(`Tên nhóm "${trimmedValue}" đã tồn tại`);
      }
    }

    // ✅ SỬA: Luôn cập nhật state để người dùng có thể nhập
    this.setState((prev) => {
      const updated = [...prev.topicGroups];
      updated[idx] = {
        ...updated[idx],
        [field]: value
      };
      return { topicGroups: updated };
    });
  };

  // ✅ THÊM: Hàm handleUpdateTopicNameGroup để cập nhật tên nhóm
  handleUpdateTopicNameGroup = (idx, newName) => {
    // ✅ Kiểm tra tham số đầu vào
    if (typeof idx !== 'number' || idx < 0 || idx >= this.state.topicGroups.length) {
      console.warn('[handleUpdateTopicNameGroup] Index không hợp lệ:', idx);
      return;
    }

    if (typeof newName !== 'string') {
      console.warn('[handleUpdateTopicNameGroup] Tên nhóm phải là chuỗi:', newName);
      return;
    }

    const trimmedName = newName.trim();

    // ✅ Kiểm tra tên trùng lặp (chỉ kiểm tra khi có giá trị)
    if (trimmedName && this.checkDuplicateTopicName(idx, trimmedName)) {
      this.showNotification("error", `Tên nhóm "${trimmedName}" đã tồn tại. Vui lòng đặt tên khác!`);
      return;
    }

    // ✅ SỬA: Xử lý giống updateMaxTopics và handleSubjectChange
    this.setState((prev) => {
      const updated = [...prev.topicGroups];

      // Cập nhật tên nhóm tại vị trí idx
      updated[idx] = {
        ...updated[idx],
        nameTopic: newName
      };

      console.log("Data update: ", JSON.stringify(updated, null, 2));

      return { topicGroups: updated }; // ✅ Chỉ return topicGroups như 2 hàm kia
    });
    // ✅ SỬA: KHÔNG gọi updateDataGroupQuestion() trong callback
  };

  // ✅ THÊM: Method updateDataGroupQuestion để đồng bộ dữ liệu
  updateDataGroupQuestion = () => {
    const { topicGroups } = this.state;

    // Chuyển đổi từ topicGroups format sang dataItemGroup format
    const dataGroupQuestion = {
      groups: topicGroups.map(group => ({
        id: group.idTopic,
        name: group.nameTopic || "",
        maxTopics: group.maxTopics || 1,
        maxSubjects: group.maxSubjects || 1,
        subjects: (group.subjects || []).map(subject => ({
          id: subject.idSubject,
          name: subject.nameSubject || "",
          questions: subject.questions || []
        }))
      }))
    };

    // Cập nhật state nếu cần
    this.setState({ dataGroupQuestion });
    console.log("Data sau khi updateDataGroupQuestion: ", JSON.stringify(dataGroupQuestion, null, 2));

  };

  // ✅ SỬA: validateCreate để kiểm tra trùng lặp tên nhóm
  validateCreate = () => {
    const { topicGroups, maxGroup } = this.state;

    // 1. Kiểm tra số nhóm tối đa
    if (!maxGroup || maxGroup < 1) {
      this.showNotification("error", "Vui lòng tạo nhóm chủ đề");
      return false;
    }

    // 2. Kiểm tra tên nhóm
    if (topicGroups.some((g) => !(g.nameTopic || "").trim())) {
      this.showNotification("error", "Vui lòng nhập tên nhóm");
      return false;
    }

    // ✅ 2.1. Kiểm tra tên nhóm trùng lặp
    const groupNames = topicGroups.map(g => g.nameTopic?.trim().toLowerCase()).filter(name => name);
    const uniqueNames = [...new Set(groupNames)];

    if (groupNames.length !== uniqueNames.length) {
      this.showNotification("error", "Không được đặt tên nhóm chủ đề trùng nhau!");
      return false;
    }

    // 3. Kiểm tra phân loại nhóm
    if (topicGroups.some((g) => !(g.type || "").trim())) {
      this.showNotification("error", "Vui lòng phân loại nhóm chủ đề");
      return false;
    }

    // 4. Kiểm tra môn học
    if (
      topicGroups.some(
        (g) =>
          !g.subjects.length || // chưa có môn nào
          g.subjects.some(
            (s) => !(s.nameSubject || "").trim() // chưa chọn tên môn
          )
      )
    ) {
      this.showNotification("error", "Vui lòng chọn ít nhất một môn học cho nhóm");
      return false;
    }

    return true;
  };

  // ✅ THÊM: Method để xóa môn học khỏi nhóm
  removeSubjectFromGroup = (groupIdx, subjectIdx) => {
    this.setState((prev) => {
      const updated = [...prev.topicGroups];

      // Kiểm tra không được xóa môn cuối cùng
      if (updated[groupIdx].subjects.length <= 1) {
        this.showNotification("warning", "Phải có ít nhất một môn học trong nhóm!");
        return null;
      }

      // Xóa môn học tại vị trí subjectIdx
      updated[groupIdx].subjects.splice(subjectIdx, 1);

      return { topicGroups: updated };
    }, () => {
      this.showNotification("success", "Đã xóa môn học thành công!");
    });
  };

  // thêm môn trong nhóm
  addSubjectToGroup = (idx) => {
    this.setState((prev) => {
      const updated = [...prev.topicGroups];
      const currentSubjectCount = updated[idx].subjects.length;

      if (currentSubjectCount >= 5) {
        this.showNotification("warning", "Chỉ được thêm tối đa 5 môn học cho mỗi nhóm!");
        return null;
      }

      const availableSubjects = this.countAvailableSubjects(updated[idx]);
      if (availableSubjects <= 0) {
        this.showNotification("warning", "Không còn môn học nào để thêm!");
        return null;
      }

      const uniqueId = "sub_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

      // 🟢 Thêm môn mới lên đầu danh sách
      updated[idx].subjects.unshift({
        idSubject: uniqueId,
        nameSubject: "",
        questions: [],
      });

      return { topicGroups: updated };
    });
  };

  handleMaxSubjectsChange = (groupIdx, value) => {
    // Kiểm tra tham số đầu vào
    if (typeof groupIdx !== 'number' || groupIdx < 0 || groupIdx >= this.state.topicGroups.length) {
      console.warn('[handleMaxSubjectsChange] Index không hợp lệ:', groupIdx);
      return;
    }

    // Chuyển đổi value thành số nguyên
    const numValue = parseInt(value) || 1;

    // Lấy nhóm hiện tại
    const currentGroup = this.state.topicGroups[groupIdx];
    const currentSubjectsCount = currentGroup.subjects.length;

    // ✅ Validation: maxSubjects phải >= 1
    if (numValue < 1) {
      this.showNotification("warning", "Số môn tối đa phải lớn hơn 0");
      return;
    }

    // ✅ Validation: maxSubjects phải <= số môn hiện có trong nhóm
    if (numValue > currentSubjectsCount) {
      this.showNotification(
        "warning",
        `Số môn tối đa không thể vượt quá ${currentSubjectsCount} môn hiện có trong nhóm`
      );
      return;
    }

    // ✅ Cập nhật state nếu validation passed
    this.setState((prev) => {
      const updated = [...prev.topicGroups];
      updated[groupIdx] = {
        ...updated[groupIdx],
        maxSubjects: numValue
      };

      return { topicGroups: updated };
    });
  };

  // thay đổi môn cụ thể
  handleSubjectChange = (groupIdx, subjectIdx, field, value) => {
    this.setState((prev) => {
      const updated = [...prev.topicGroups];
      updated[groupIdx].subjects = [...updated[groupIdx].subjects];
      updated[groupIdx].subjects[subjectIdx] = {
        ...updated[groupIdx].subjects[subjectIdx],
        [field]: value, // field có thể là nameSubject, duration, score
      };
      return { topicGroups: updated };
    });
  };

  // Hàm tính số môn còn có thể chọn
  countAvailableSubjects = (group) => {
    if (!this.props.subjects || !Array.isArray(this.props.subjects)) return 0;

    // Lấy tất cả môn đã chọn trong group (chỉ lấy nameSubject, loại bỏ rỗng)
    const selectedSubjects = group.subjects
      .map((s) => s.nameSubject)
      .filter((name) => name);

    // Lọc những môn chưa được chọn
    const available = this.props.subjects.filter(
      (obj) => !selectedSubjects.includes(obj.name)
    );

    return available.length;
  };

  updateMaxTopics = (value) => {
    const numValue = parseInt(value) || 1;

    // ✅ SỬA: Cập nhật maxTopics cho tất cả nhóm và maxGroup
    this.setState((prev) => {
      const updated = [...prev.topicGroups];

      // Cập nhật maxTopics cho từng nhóm
      updated.forEach((group) => {
        group.maxTopics = numValue;
      });

      console.log("Data update max topics: ", JSON.stringify(updated, null, 2));
      return {
        topicGroups: updated,
      };
    });
  };

  render() {
    const { topicGroups, maxGroup } = this.state;
    return (
      <div className="modal-body" style={{ fontSize: "15px" }}>
        {/* Tiêu đề */}
        <div
          style={{
            maxHeight: "70vh", // Giới hạn chiều cao (70% màn hình)
            overflowY: "auto", // Cho phép cuộn dọc
            paddingRight: "8px", // Tránh che mất nội dung bởi scrollbar
          }}
        >
          <h4 className="mb-4 font-weight-bold border-bottom pb-2">
            Cài đặt Nhóm Chủ Đề
          </h4>

          {/* Input số nhóm chủ đề tối đa */}
          <div className="form-group mb-4">
            <label
              style={{
                fontSize: "14px",
                fontWeight: "600",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Số nhóm chủ đề tối đa được chọn
            </label>
            <input
              type="number"
              min="1"
              className="form-control w-auto"
              value={this.state.actionGroup === "create" ? maxGroup : topicGroups[0].maxTopics}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10) || 1;
                const maxAllowed = this.state.topicGroups?.length || 1;

                if (value > maxAllowed) {
                  this.showNotification("warning", `Số nhóm không hợp lệ. Hiện có ${maxAllowed} nhóm.`);
                  return;
                }
                this.setState({ maxGroup: value }, () => {
                  this.updateMaxTopics(value);
                });
              }}
              placeholder="Nhập số nhóm tối đa"
            />
          </div>

          {/* Sinh nhóm chủ đề */}
          {topicGroups.map((group, idx) => {
            const isDuplicateName = this.checkDuplicateTopicName(idx, group.nameTopic);
            return (
              <div
                key={group.idTopic}
                className="p-3 mb-4"
                style={{
                  backgroundColor: "#f5f9ff",
                  borderRadius: "10px",
                  border: "1px solid #d6e4ff",
                }}
              >
                <div
                  className="p-4"
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  {/* Tiêu đề nhóm + nút xóa */}
                  <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                    <h5 className="font-weight-bold mb-0">Nhóm chủ đề {idx + 1}</h5>
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={() => this.removeGroup(idx)}
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        lineHeight: "1",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Hàng 1: Tên nhóm + Loại nhóm + Chọn tối đa (chỉ nếu multiple) */}
                  <div className="form-group row align-items-center mb-4">
                    {/* Tên nhóm */}
                    <div className="col-md-5 mb-3">
                      <input
                        type="text"
                        className={`form-control ${isDuplicateName ? 'is-invalid' : ''}`}
                        placeholder="Tên nhóm chủ đề"
                        defaultValue={group.nameTopic || ''} // ✅ Dùng defaultValue để tránh trigger khi gõ
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (this.state.actionGroup === "create") {
                            this.handleGroupChange(idx, "nameTopic", value);
                          } else {
                            this.handleUpdateTopicNameGroup(idx, value);
                          }
                        }}
                        style={{
                          border: isDuplicateName ? "1px solid #dc3545" : "1px solid #ccc",
                          borderRadius: "6px",
                        }}
                      />

                      {/* ✅ SỬA: Chỉ hiển thị lỗi khi có tên và trùng lặp */}
                      {isDuplicateName && (
                        <small className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                          Tên nhóm này đã tồn tại!
                        </small>
                      )}
                    </div>

                    {/* Loại nhóm */}
                    <div className="col-md-3 mb-3">
                      <select
                        className="form-control"
                        value={group.type || ""}
                        onChange={(e) =>
                          this.handleGroupChange(idx, "type", e.target.value)
                        }
                      >
                        <option value="" disabled hidden>-- Môn học --</option>
                        <option value="single">Một môn</option>
                        <option value="multiple">Nhiều môn</option>
                      </select>
                    </div>

                    {/* Chọn tối đa chỉ khi nhiều môn */}
                    {group.type === "multiple" && (
                      <div className="col-md-4 mb-3">
                        <label
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            display: "block",
                            marginBottom: "4px",

                          }}
                        >
                          Chọn tối đa
                        </label>
                        <input
                          type="number"
                          // min="1"
                          // max={group.subjects.length} // ✅ THÊM: Giới hạn max bằng số môn hiện có
                          placeholder="3"
                          className="form-control"
                          style={{ width: "100px" }}
                          value={group.maxSubjects = 3} // ✅ THÊM: Hiển thị giá trị hiện tại
                          disabled={true}
                        // onChange={(e) => {
                        //   this.handleMaxSubjectsChange(idx, e.target.value);
                        // }}
                        />
                        <small
                          style={{
                            fontSize: "12px",
                            color: "#888",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          Chọn 1 trong {this.countAvailableSubjects(group)} môn
                        </small>
                      </div>
                    )}

                  </div>
                  <div className="form-group row align-items-start mb-3">
                    <div className="col-md-12">

                      {/* --- Nút thêm môn ở trên cùng --- */}
                      {group.type === "multiple" && (
                        <div className="d-flex justify-content-end mb-3">
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => this.addSubjectToGroup(idx)}
                            style={{
                              fontWeight: "500",
                              borderRadius: "6px",
                              whiteSpace: "nowrap",
                              padding: "8px 16px",
                            }}
                            disabled={
                              group.subjects.length >= 5 ||
                              group.subjects.some((s) => !s.idSubject)
                            }
                          >
                            + Thêm môn
                          </button>
                        </div>
                      )}

                      {/* --- Danh sách các môn học --- */}
                      {group.subjects.map((subj, sIdx) => {
                        // ✅ Tìm subject tương ứng trong props.subjects
                        const matchedSubject =
                          subj.idSubject && this.props.subjects.find((s) => s._id === subj.idSubject)
                            ? this.props.subjects.find((s) => s._id === subj.idSubject)
                            : subj.nameSubject
                              ? this.props.subjects.find(
                                (s) =>
                                  s.name &&
                                  subj.nameSubject &&
                                  s.name.toUpperCase() === subj.nameSubject.toUpperCase()
                              )
                              : null;

                        // ✅ Tạo value cho select
                        const selectValue =
                          matchedSubject && matchedSubject._id && matchedSubject.name
                            ? `${matchedSubject._id}|${matchedSubject.name.toUpperCase()}`
                            : "";

                        return (
                          <div
                            key={sIdx}
                            className="p-3 mb-3"
                            style={{
                              backgroundColor: "#f8faff",
                              border: "1px solid #e1e6f0",
                              borderRadius: "8px",
                            }}
                          >
                            <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                              {/* Dropdown chọn môn */}
                              <div className="flex-grow-1">
                                <label
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Môn học
                                </label>

                                <select
                                  className="form-control"
                                  value={selectValue}
                                  disabled={!!selectValue} // disable khi đã chọn
                                  onChange={(e) => {
                                    const [id, name] = e.target.value.split("|");
                                    const uniqueId = `${id}_${idx}_${Date.now()}`; // tạo id duy nhất
                                    this.handleSubjectChange(idx, sIdx, "idSubject", uniqueId);
                                    this.handleSubjectChange(idx, sIdx, "nameSubject", name);
                                  }}
                                >
                                  <option value="" disabled hidden>
                                    -- Chọn môn --
                                  </option>

                                  {Array.isArray(this.props.subjects) &&
                                    this.props.subjects.map((obj) => {
                                      const isSelectedElsewhere = group.subjects.some(
                                        (s, i) =>
                                          i !== sIdx &&
                                          (s.idSubject === obj._id ||
                                            s.nameSubject?.toUpperCase() === obj.name.toUpperCase())
                                      );

                                      return (
                                        <option
                                          key={obj._id}
                                          value={`${obj._id}|${obj.name.toUpperCase()}`}
                                          disabled={isSelectedElsewhere}
                                          style={{
                                            fontStyle: isSelectedElsewhere ? "italic" : "normal",
                                            backgroundColor: isSelectedElsewhere ? "#e0e0e0" : "white",
                                            color: isSelectedElsewhere ? "#888" : "#000",
                                          }}
                                        >
                                          {isSelectedElsewhere
                                            ? `${obj.name.toUpperCase()} (ĐÃ CHỌN)`
                                            : obj.name.toUpperCase()}
                                        </option>
                                      );
                                    })}
                                </select>
                              </div>

                              {/* Nút xóa môn (chỉ hiển thị khi có hơn 1 môn) */}
                              {group.subjects.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => this.removeSubjectFromGroup(idx, sIdx)}
                                  style={{
                                    fontWeight: "500",
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                    height: "fit-content",
                                    marginTop: "22px",
                                    padding: "6px 12px",
                                  }}
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>)
          }
          )}

          {/* Nút thêm nhóm */}
          <button
            type="button"
            className="btn mb-4 px-4 py-2"
            onClick={this.addGroup}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            + Thêm nhóm
          </button>

          {/* Footer */}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-light mt-2 ml-2 px-4 py-2"
              onClick={() => {
                if (this.state.actionGroup === "create") {
                  this.closeModal(); // Reset và đóng modal khi tạo mới
                } else {
                  // Chế độ update - chỉ đóng modal không reset dữ liệu
                  if (this.props.closeModal && typeof this.props.closeModal === 'function') {
                    this.props.closeModal();
                  } else {
                    // FALLBACK: Nếu không có props.closeModal, sử dụng jQuery
                    $("#createGroup").hide();
                    $("body").removeClass("modal-open");
                    $(".modal-backdrop").remove();
                  }
                }
              }}
              style={{ borderRadius: "6px", border: "1px solid #ccc" }}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary mt-2 ml-2 px-4 py-2"
              onClick={this.createOrUpdateGroup}
              style={{ borderRadius: "6px", fontWeight: "500" }}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    );
  }

  closeModal = () => {

    // Reset state về trạng thái ban đầu
    this.clearAllInputs();

    // ✅ SỬA: Gọi closeModal từ props (được truyền từ ExamCreate.js)
    if (this.props.closeModal && typeof this.props.closeModal === 'function') {
      this.props.closeModal();
    } else {
      // ✅ FALLBACK: Nếu không có props.closeModal, sử dụng jQuery
      $("#createGroup").hide();
      $("body").removeClass("modal-open");
      $(".modal-backdrop").remove();
    }
  };
}

ModalGroupQuestion.propTypes = {
  subjects: PropTypes.array.isRequired,
  listSubject: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  onCreateGroup: PropTypes.func,
  onUpdateGroup: PropTypes.func,
  onDataChange: PropTypes.func, // ✅ THÊM: Callback để đồng bộ dữ liệu
  dataItemGroup: PropTypes.object, // ✅ THÊM: Dữ liệu nhóm từ component cha
  actionGroup: PropTypes.string, // ✅ THÊM: Mode create/update
  groupDetail: PropTypes.object, // ✅ THÊM: Chi tiết nhóm khi update
  uniqueKey: PropTypes.string, // ✅ THÊM: Key để reset component
};

const mapStateToProps = (state) => ({
  subjects: state.subject.subjects,
});

export default connect(mapStateToProps, { listSubject })(ModalGroupQuestion);