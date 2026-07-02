import moment from 'moment';
import Moment from "moment-timezone";

class BaseHelper {
    renderQuestionHTML(question) {
        let _content = '';
        try {
            const kind = question.kind;
            const content = question.content;
            if (kind === 'text/0')
                _content += `<span>${content}</span>`;

            if (kind === 'text/1')
                _content += `<b>${content}</b>`;

            if (kind === 'text/2')
                _content += `<em>${content}</em>`;

            if (kind === 'text/3')
                _content += `<b><em>${content}</em><b>`;

            if (kind === 'text/4')
                _content += `<u>${content}</u>`;

            if (kind === 'text/8')
                _content += `<span style="background:yellow">${content}</span>`;

            if (kind === 'text/16')
                _content += `<sub>${content}</sub>`;

            if (kind === 'text/32')
                _content += `<sup>${content}</sup>`;

            if (kind === 'text/64')
                _content += `<b>${content}</b>`;

            if (kind === 'br')
                _content += `<br/>`;

            if (kind === 'error/0')
                _content += `<span style="background:red">ERROR!: ${content}</span>`;

            if (kind === 'image/png') {
                const base64Image = `data:${kind};base64,${content}`;
                _content += `<img src=${base64Image} alt=""/>`;
            }
        } catch (err) {
            console.log(err);
        }

        return _content;
    }

    currencyFormat(value) {
        return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    formatDateToString(value) {
        return moment(value).format('DD/MM/YYYY HH:mm:ss')
    }

    getFromDate(date) {
        if (!this.getMoment().isMoment(date)) {
            return date;
        }

        const _date = date.clone();
        _date.set({
            hour: 0,
            minute: 0,
            second: 0,
            milisecond: 0,
        });

        return _date;
    }

    getToDate(date) {
        if (!this.getMoment().isMoment(date)) {
            return date;
        }

        const _date = date.clone();
        _date.set({
            hour: 23,
            minute: 59,
            second: 59,
            milisecond: 999,
        });

        return _date;
    }
    getMoment() {
        if (!this.moment) {
            this.moment = Moment;
        }

        return this.moment;
    }


    //upload file binary

    getFormDataUpload(files, folder) {
        const form = new FormData();
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            //   if (item.size / 1024 / 1024 > appConfig.IMAGE_SIZE_ALLOW) {
            //     return false;
            //   }
            form.append("files", item, item.name);
            form.append("folder", folder);
        }
        return form;
    }

    getSunEditorOptions() {
        return [
            // default
            ['undo', 'redo'],
            ['font', 'fontSize'],
            [':p-More Paragraph-default.more_paragraph', 'formatBlock', 'paragraphStyle', 'blockquote'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['removeFormat'],
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save'],
            ['-right', 'table', 'math'],
            ['-right', 'image', 'video', 'audio', 'link'],
            // (min-width: 992)
            ['%992', [
                ['undo', 'redo'],
                [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                ['bold', 'underline', 'italic', 'strike'],
                [':t-More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save'],
                ['-right', ':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math']
            ]],
            // (min-width: 767)
            ['%767', [
                ['undo', 'redo'],
                [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                [':e-More Line-default.more_horizontal', 'align', 'horizontalRule', 'list', 'lineHeight'],
                [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math'],
                ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save']
            ]],
            // (min-width: 480)
            ['%480', [
                ['undo', 'redo'],
                [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle', 'removeFormat'],
                [':e-More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'lineHeight'],
                [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math'],
                ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save']
            ]]
        ]

    }
    getSunEditorOptions2() {
        return [
            // default
            ['undo', 'redo'],
            ['font', 'fontSize'],
            [':p-More Paragraph-default.more_paragraph', 'formatBlock', 'paragraphStyle', 'blockquote'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['removeFormat'],
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save'],
            ['-right', 'table'],
            ['-right', 'image', 'video', 'audio', 'link'],
            // (min-width: 992)
            ['%992', [
                ['undo', 'redo'],
                [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                ['bold', 'underline', 'italic', 'strike'],
                [':t-More Text-default.more_text', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save'],
                ['-right', ':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio']
            ]],
            // (min-width: 767)
            ['%767', [
                ['undo', 'redo'],
                [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                [':e-More Line-default.more_horizontal', 'align', 'horizontalRule', 'list', 'lineHeight'],
                [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio'],
                ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save']
            ]],
            // (min-width: 480)
            ['%480', [
                ['undo', 'redo'],
                [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                [':t-More Text-default.more_text', 'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'fontColor', 'hiliteColor', 'textStyle', 'removeFormat'],
                [':e-More Line-default.more_horizontal', 'outdent', 'indent', 'align', 'horizontalRule', 'list', 'lineHeight'],
                [':r-More Rich-default.more_plus', 'table', 'link', 'image', 'video', 'audio', 'math'],
                ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save']
            ]]
        ]

    }
    getSunEditorAttributeWhitelist() {
        return {
            span: 'class|style|data-latex|contenteditable|aria-hidden',
            svg: 'class|style|width|height|viewbox|preserveaspectratio|fill|stroke|stroke-width|aria-hidden|role|focusable',
            path: 'd|fill|stroke|stroke-width',
            symbol: 'id|viewbox',
            use: 'href|xlink:href'
        };
    }

    truncateText(text, maxLength = 20) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Normalize evaluation/review data to handle four API formats
     * Format 1: DANHGIA_PHUHUYNH with name, content, description, image, status
     * Format 2: PHU_HUYNH with parents object containing name, description, images
     * Format 3: Teacher/classroom review with user object, classroom object, comment
     * Format 4: HOC_SINH (student) review with students object, teacher, classroom, subject
     */
    normalizeEvaluationData(item) {
        if (!item) return item;

        // Check if it's Format 4 (HOC_SINH with students object)
        if (item.students && typeof item.students === 'object') {
            return {
                ...item,
                name: item.students.name || '',
                description: item.teacher || (item.classroom ? item.classroom.name : ''),
                content: item.comment || '',
                image: item.students.avatar || item.students.images || '',
                status: !item.hiden, // Convert hiden to status (inverse)
            };
        }

        // Check if it's Format 2 (PHU_HUYNH with parents object)
        if (item.parents && typeof item.parents === 'object') {
            return {
                ...item,
                name: item.parents.name || '',
                description: item.parents.description || '',
                content: item.comment || item.parents.description || '',
                image: item.parents.images || item.parents.thumnailImg || '',
                status: !item.hiden, // Convert hiden to status (inverse)
            };
        }

        // Check if it's Format 3 (with user and classroom objects)
        if (item.user && typeof item.user === 'object') {
            return {
                ...item,
                name: item.user.name || '',
                description: item.classroom ? `${item.classroom.name}` : (item.teacher || ''),
                content: item.comment || '',
                image: item.image || '',
                status: !item.hiden, // Convert hiden to status (inverse)
            };
        }

        // Format 1 is already in correct format, just ensure all fields exist
        return {
            ...item,
            name: item.name || '',
            description: item.description || '',
            content: item.content || '',
            image: item.image || '',
            status: item.status !== undefined ? item.status : true,
        };
    }

}

export default new BaseHelper();
