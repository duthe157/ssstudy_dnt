const BaseHelper = require('../helpers/BaseHelper');
const CartModel = require('../models/Cart');
const CartItemModel = require('../models/CartItem');
const BookCategoryModel = require('../models/BookCategory');
const CouponModel = require('../models/Coupon');
const CartCategoryModel = require('../models/CartCategory');
const SubjectModel = require('../models/Subject');
const ClassroomModel = require('../models/Classroom');
const BookModel = require('../models/Book');
const ClassroomService = require('../services/ClassroomService');
const CartService = require('../services/CartService');
const appConfig = require('../../config/app');
const BookId = require('../models/BookId');
const BookIdCourse = require('../models/BookIdCourse');
const StudentBookIdModel = require('../models/StudentBookId');

const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class CartController {
    async productGroup(req, res, params) {
        try {
            const categoryClassrooms = await CartCategoryModel.find({ deleted_at: null, status: true });
            const categoryBooks = await BookCategoryModel.find({ deleted_at: null, show_on_cart: true });
            return response(res, { categoryClassrooms, categoryBooks }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listProductByType(req, res, params) {
        try {
            const type = params.type || null;
            const categoryID = params.category_id || null;
            const arraySubject = [];
            const subjects = await SubjectModel.find({ deleted_at: null });
            const subjectIds = [];
            let conditions = { deleted_at: null };
            for (let i = 0; i < subjects.length; i++) {
                subjectIds.push(subjects[i].id);
                const _subject = subjects[i].toObject();
                _subject.classrooms = [];
                _subject.books = [];
                arraySubject.push(_subject);
            }
            const _data = [];

            if (type === 'CLASSROOM') {
                conditions = {
                    deleted_at: null,
                    'subject.id': {
                        $in: subjectIds
                    },
                    cart_category_id: categoryID
                };
                const _classrooms = await ClassroomModel.find(conditions);
                for (let i = 0; i < arraySubject.length; i++) {
                    for (let j = 0; j < _classrooms.length; j++) {
                        if (arraySubject[i]._id == _classrooms[j].subject.id) {
                            arraySubject[i].classrooms.push(_classrooms[j]);
                        }
                    }
                }
            }

            if (type === 'BOOK') {
                conditions = {
                    deleted_at: null,
                    'subject.id': {
                        $in: subjectIds
                    },
                    'category.id': categoryID
                };
                const _books = await BookModel.find(conditions);
                for (let i = 0; i < arraySubject.length; i++) {
                    for (let j = 0; j < _books.length; j++) {
                        if (arraySubject[i]._id == _books[j].subject.id) {
                            arraySubject[i].books.push(_books[j]);
                        }
                    }
                }
            }

            for (let i = 0; i < arraySubject.length; i++) {
                if (arraySubject[i].classrooms.length > 0 || arraySubject[i].books.length > 0)
                    _data.push(arraySubject[i]);
            }

            const products = _data;
            return response(res, { products }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            let discountTotal = 0;
            const cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart)
                return response(res, { cart: null, cart_items: null }, 'Thành công', statusCode.OK);

            if (cart.discount_code) {
                discountTotal = await CartService.calDiscount(cart.subtotal, cart.discount_code);
                if (discountTotal > cart.discount_total || discountTotal < cart.discount_total) {
                    await CartModel.updateOne({ _id: cart.id }, cart);
                }
                cart.discount_total = discountTotal;
            }

            const options = {
                sort: { created_at: 1 }
            };

            const cartItems = await CartItemModel.find({ cart_id: cart._id }, null, options);
            const data = {
                cart: cart,
                bank_info: appConfig.BANK_INFO,
                cart_items: cartItems ? cartItems : []
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async count(req, res, params) {
        try {
            let qty = 0;
            const aggregate = [
                { $match: { user_id: req.user.user_id, cart_parent_id: null } },
                { $group: { _id: '$user_id', qty: { $sum: '$qty' } } }
            ];
            const data = await CartItemModel.aggregate(aggregate);
            if (data && data.length > 0) {
                qty = data[0].qty;
            }

            const cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart) {
                qty = 0;
                await CartItemModel.delete({ user_id: req.user.user_id }, true);
            }

            return response(res, { qty }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async add(req, res, params) {
        try {
            const itemID = params.item_id || null;
            const name = params.name || null;
            let qty = params.qty || 1;
            const image = params.image || null;
            const type = params.type || null;
            const price = params.price || 0;
            const originPrice = params.origin_price || 0;
            const userID = req.user.user_id;
            const note = params.note || null;
            const parentID = params.cart_parent_id || null;
            let discountCode = null;

            if (type === 'CLASSROOM') {
                qty = 1;
                const isUserInClassroom = await ClassroomService.isUserInClassroom(req.user, itemID);
                if (isUserInClassroom)
                    return response(res, null, 'Bạn đã tham gia khoá học này rồi. Vui lòng truy cập vào Khoá học của tôi để bắt đầu học.', statusCode.ERROR);
            }

            if (type === 'BOOK' || type === 'BOOKID') {
                const bookid = await BookId.findOne({ _id: itemID })
                if (bookid) {
                    qty = 1;
                    const studentBookId = await StudentBookIdModel.findOne({
                        'bookIdCourse.id': itemID,
                        'user.id': userID,
                        deleted_at: null
                    });
                    if (studentBookId && new Date(studentBookId.exprired_date) > new Date()) {
                        return response(res, null, 'Bạn đã sở hữu sách ID này và vẫn còn hạn sử dụng. Vui lòng truy cập vào nội dung sách hoặc tiến hành gia hạn.', statusCode.ERROR);
                    }
                }
            }

            let cart = await CartModel.findOne({ user_id: userID });
            if (!cart) {
                cart = await CartModel.create({
                    discount_total: 0,
                    discount_code: null,
                    subtotal: 0,
                    total: 0,
                    user_id: userID
                });
            }

            let docCartItem = {
                item_id: itemID,
                user_id: userID,
                cart_id: cart._id,
                name,
                cart_parent_id: parentID,
                qty,
                type,
                price,
                origin_price: originPrice,
                note,
                is_selected: false,
                image
            };
            if (type === 'EXTEND_BOOKID') {
                console.log('Gia hạn sách ID:' + itemID);   
                const bookid = await BookId.findOne({ _id: itemID })
                if (!bookid)                    return response(res, null, 'Sách ID không tồn tại.', statusCode.ERROR);
                docCartItem = {
                    item_id: itemID,
                    cart_parent_id: parentID,
                    origin_object_id: itemID,
                    user_id: userID,
                    cart_id: cart._id,
                    name: 'Gia hạn ' + bookid.name,
                    qty: 1,
                    type: 'EXTEND_BOOKID',
                    price: bookid.renewed_bookId.price_renewal,
                    origin_price: bookid.renewed_bookId.price_renewal,
                    note: 'Gia hạn sách ID',
                    is_selected: false,
                    image: bookid.image || null
                }
            }
            let rs = null;
            const conditions = {
                item_id: itemID,
                user_id: userID
            }
            let _item = await CartItemModel.findOne(conditions);
            if (_item) {
                const _updateData = {};
                if (_item.type === 'EXTEND_BOOKID') {
                    return response(res, null, 'Đã tồn tại sản phẩm này trong giỏ hàng. Vui lòng truy cập vào giỏ hàng để xem chi tiết.', statusCode.ERROR);
                }
                if (_item.type === 'CLASSROOM') {
                    return response(res, null, 'Đã tồn tại khóa học này trong giỏ hàng. Vui lòng truy cập vào giỏ hàng để xem chi tiết.', statusCode.ERROR);
                }

                if (_item.type === 'BOOK') {
                    _updateData.$set = {
                        $inc: { qty: +1 }
                    };
                }

                if (parentID) {
                    _updateData.$set = {
                        cart_parent_id: parentID
                    }
                }
                if (Object.keys(_updateData).length > 0)
                    rs = await CartItemModel.updateOne(conditions, _updateData);
            } else
                rs = await CartItemModel.create(docCartItem);

            if (rs) {
                if (type === 'CLASSROOM') {
                    const classroom = await ClassroomModel.findOne({ _id: itemID });
                    if (classroom.book_attached && classroom.book_attached.length > 0) {
                        for (let i = 0; i < classroom.book_attached.length; i++) {
                            const _book = await BookModel.findOne({ _id: classroom.book_attached[i], status: true, delete_at: null });
                            if (_book) {
                                const _docBookItem = {
                                    item_id: classroom.book_attached[i],
                                    cart_parent_id: rs._id,
                                    origin_object_id: itemID,
                                    user_id: req.user.user_id,
                                    cart_id: cart._id,
                                    name: _book.name,
                                    qty: 1,
                                    type: 'BOOK',
                                    price: 0,
                                    origin_price: _book.origin_price,
                                    note: 'Sách kèm khoá học',
                                    is_selected: false,
                                    image: _book.image || null
                                }
                                _item = await CartItemModel.findOne({
                                    cart_parent_id: rs._id,
                                    item_id: classroom.book_attached[i],
                                    origin_object_id: itemID
                                });
                                if (!_item)
                                    await CartItemModel.create(_docBookItem);
                            }
                        }
                    }

                    if (classroom.classroom_attached && classroom.classroom_attached.length > 0) {
                        for (let i = 0; i < classroom.classroom_attached.length; i++) {
                            const _classroom = await ClassroomModel.findOne({ _id: classroom.classroom_attached[i], status: true, delete_at: null });
                            if (_classroom) {
                                const _docClassroomItem = {
                                    item_id: classroom.classroom_attached[i],
                                    cart_parent_id: rs._id,
                                    origin_object_id: itemID,
                                    user_id: req.user.user_id,
                                    cart_id: cart._id,
                                    name: _classroom.name,
                                    qty: 1,
                                    type: 'CLASSROOM',
                                    price: 0,
                                    origin_price: _classroom.origin_price,
                                    note: 'Khoá học kèm khoá học',
                                    is_selected: false,
                                    image: _classroom.image || null
                                }
                                _item = await CartItemModel.findOne({
                                    cart_parent_id: rs._id,
                                    item_id: classroom.classroom_attached[i],
                                    origin_object_id: itemID
                                });
                                if (!_item)
                                    await CartItemModel.create(_docClassroomItem);
                            }
                        }
                    }
                }

                if (type === 'BOOK' || type === 'BOOKID') {
                    let book = await BookModel.findOne({ _id: itemID });
                    if (!book) {
                        book = await BookId.findOne({ _id: itemID })
                        if (book && book.classroom_attached && book.classroom_attached.length > 0) {
                            for (let i = 0; i < book.classroom_attached.length; i++) {
                                const _classroom = await BookIdCourse.findOne({ _id: book.classroom_attached[i], status: true, delete_at: null });
                                if (_classroom) {
                                    const _docBookItem = {
                                        item_id: book.classroom_attached[i],
                                        cart_parent_id: rs._id,
                                        origin_object_id: itemID,
                                        user_id: req.user.user_id,
                                        cart_id: cart._id,
                                        name: _classroom.name,
                                        qty: 1,
                                        type: 'CLASSROOM',
                                        price: 0,
                                        origin_price: _classroom.origin_price,
                                        note: 'Khoá học kèm sách',
                                        is_selected: false,
                                        image: _classroom.image || null
                                    }
                                    const _itemBook = await CartItemModel.findOne({
                                        cart_parent_id: rs._id,
                                        item_id: book.classroom_attached[i],
                                        origin_object_id: itemID
                                    });
                                    if (!_itemBook)
                                        await CartItemModel.create(_docBookItem);
                                }
                            }
                        }
                    } else {
                        if (book.classroom_attached && book.classroom_attached.length > 0) {
                            for (let i = 0; i < book.classroom_attached.length; i++) {
                                const _classroom = await ClassroomModel.findOne({ _id: book.classroom_attached[i], status: true, delete_at: null });
                                // console.log('_classroom:' + JSON.stringify(_classroom));
                                if (_classroom) {
                                    const _docBookItem = {
                                        item_id: book.classroom_attached[i],
                                        cart_parent_id: rs._id,
                                        origin_object_id: itemID,
                                        user_id: req.user.user_id,
                                        cart_id: cart._id,
                                        name: _classroom.name,
                                        qty: 1,
                                        type: 'CLASSROOM',
                                        price: 0,
                                        origin_price: _classroom.origin_price,
                                        note: 'Khoá học kèm sách',
                                        is_selected: false,
                                        image: _classroom.image || null
                                    }
                                    const _itemBook = await CartItemModel.findOne({
                                        cart_parent_id: rs._id,
                                        item_id: book.classroom_attached[i],
                                        origin_object_id: itemID
                                    });
                                    if (!_itemBook)
                                        await CartItemModel.create(_docBookItem);
                                }
                            }
                        }
                    }
                    // console.log('book.classroom_attached:' + JSON.stringify(book.classroom_attached));
                }

                if (cart.discount_code)
                    discountCode = cart.discount_code;
                const cartRs = await CartService.updateCartData(cart, discountCode);
                if (!cartRs) {
                    await CartItemModel.delete(conditions);
                    await CartService.updateCartData(cart, discountCode);
                }

                let qty = 0;
                const aggregate = [
                    { $match: { user_id: req.user.user_id } },
                    { $group: { _id: '$user_id', qty: { $sum: '$qty' } } }
                ];
                const data = await CartItemModel.aggregate(aggregate);
                if (data && data.length > 0) {
                    qty = data[0].qty;
                }

                return response(res, { total_qty: qty }, 'Đã thêm sản phẩm vào giỏ.', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateInfo(req, res, params) {
        try {
            const note = params.note || '';
            const selectedAll = params.is_selected_all || false;
            let cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart)
                return response(res, null, 'Không thêm được sản phẩm vào giỏ hàng!', statusCode.ERROR);
            let rs;
            rs = await CartItemModel.updateMany({ cart_id: cart._id }, { $set: { is_selected: selectedAll } });

            let discountCode = null;
            if (cart.discount_code)
                discountCode = cart.discount_code;

            cart.note = note;
            rs = await CartModel.updateOne({ user_id: req.user.user_id }, {
                $set: {
                    note: note,
                }
            });
            rs = await CartService.updateCartData(cart, discountCode);
            if (rs.nModified)
                await CartService.updateCartData(cart, discountCode);
            return response(res, {}, 'Cập nhật giỏ hàng thành công.', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const itemID = params.item_id || null;
            const price = params.price || 0;
            let qty = params.qty || 1;
            const note = params.note || '';
            const isSelected = params.is_selected;
            let cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart)
                return response(res, null, 'Không thêm được sản phẩm vào giỏ hàng!', statusCode.ERROR);

            let discountCode = null;
            if (cart.discount_code)
                discountCode = cart.discount_code;

            const conditions = {
                item_id: itemID,
                user_id: req.user.user_id
            };

            const cartItem = await CartItemModel.findOne(conditions);
            let oldQty = cartItem.qty;
            if (cartItem.type === 'CLASSROOM') {
                qty = 1;
                oldQty = 1;
            }
              if (cartItem.type === 'EXTEND_BOOKID') {
                qty = 1;
                oldQty = 1;
            }
            cartItem.qty = parseFloat(qty);
            cartItem.price = price;
            cartItem.note = note;
            cartItem.is_selected = isSelected;
            let rs = await CartItemModel.updateOne(conditions, cartItem);
            if (rs.nModified) {
                await CartItemModel.updateMany({
                    cart_parent_id: cartItem._id
                }, {
                    $set: {
                        is_selected: isSelected
                    }
                });
                // console.log("Vao day====")
                rs = await CartService.updateCartData(cart, discountCode);
                if (!rs) {
                    // console.log(rs);
                    cartItem.qty = oldQty;
                    // await CartItemModel.updateOne(conditions, cartItem);
                    await CartService.updateCartData(cart, discountCode);
                }
                return response(res, {}, 'Cập nhật giỏ hàng thành công.', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async applyCoupon(req, res, params) {
        try {
            const couponCode = params.discount_code || null;
            if (!couponCode)
                return response(res, null, 'Mã khuyến mại không hợp lệ.', statusCode.OK);
            const coupon = await CouponModel.findOne({ code: couponCode.trim() });
            if (!coupon || (coupon && !coupon.status))
                return response(res, null, 'Mã khuyến mại không hợp lệ.', statusCode.OK);

            let cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart)
                return response(res, null, 'Giỏ hàng trống!', statusCode.OK);

            if (!cart.discount_code)
                await CartService.updateCartData(cart, couponCode);

            return response(res, null, 'Áp dụng mã khuyến mãi thành công.', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async removeCoupon(req, res, params) {
        try {
            const couponCode = params.discount_code || null;
            const coupon = await CouponModel.findOne({ code: couponCode.trim() });
            if (!coupon || (coupon && !coupon.status))
                return response(res, null, 'Mã khuyến mại không hợp lệ.', statusCode.OK);

            let cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart)
                return response(res, null, 'Giỏ hàng trống!', statusCode.OK);

            await CartService.updateCartData(cart, null);
            return response(res, null, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const id = params.id || null;

            let cart = await CartModel.findOne({ user_id: req.user.user_id });
            if (!cart)
                return response(res, null, 'Giỏ hàng trống.', statusCode.ERROR);

            let discountCode = null;
            if (cart.discount_code)
                discountCode = cart.discount_code;

            const rs = await CartItemModel.delete({ _id: id });
            if (rs) {
                await CartItemModel.delete({ cart_parent_id: id }, true);
                await CartService.updateCartData(cart, discountCode);
            }

            return response(res, [], 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new CartController();