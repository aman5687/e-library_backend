const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const Author = require("../models/authorModel");
const Category = require("../models/categoryModel");
const Bookings = require("../models/bookBookings");
const Book = require("../models/book");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)



// multer configs
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

// ends here

// cloudinary configs

cloudinary.config({
    cloud_name: 'djrh8oflc',
    api_key: '544113442678141',
    api_secret: 'G6AKEYGFz2eiEcVHXg-4myu5cXg'
});

// ends here


// registration api starts
router.post("/register", async (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const number = req.body.number
    const password = req.body.password
    const confPassword = req.body.confPassword
    const token = uuidv4();

    const errors = [];

    if (!name) {
        errors.push("Please enter a name");
    }
    if (!email) {
        errors.push("Please enter an email");
    }
    if (!number) {
        errors.push("Please enter a password");
    }
    if (!confPassword) {
        errors.push("Please enter a password");
    }
    if (number.length !== 10) {
        errors.push("Number should be 10 digits long");
    }
    if (!password) {
        errors.push("Please enter a password");
    }
    if (password !== confPassword) {
        errors.push("Password and Confirm Password should be same");
    }
    if (!validator.isEmail(email)) {
        errors.push("Please enter a valid email");
    }
    if (password.length < 8) {
        errors.push("Password should be atleast 8 characters long");
    }

    if (errors.length > 0) {
        res.status(400).json({ errors })
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 8);
            const user = new User({
                name,
                email,
                number,
                hashedPassword,
                token,
            });
            const savedUser = await user.save();

            if (!savedUser) {
                res.status(500).send({ message: "Error occured" });
            } else {
                res.status(200).send({ message: "Successful" });
            }
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
                res.status(409).json({ message: "Email is already in use, please enter a unique email" }); // Use 409 Conflict
            } else {
                console.error(error);
                res.status(500).json({ message: "Error in catch" }); // Use 500 Internal Server Error
            }
        }
    }
});
// ends



// login api
router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sessionStorage = req.session.userInfo;

    const errors = [];

    if (!email) {
        errors.push("Please provide the email");
    }
    if (!password) {
        errors.push("Please provide the password");
    }
    if (!validator.isEmail(email)) {
        errors.push("Please enter a valid email");
    }
    if (sessionStorage) {
        errors.push("You are already logged in");
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }
    const user = await User.findOne({ email });

    if (!user) {
        errors.push("This email is not registered");
        res.status(400).json({ errors });
        return;
    } else {
        const checkPassword = await bcrypt.compare(password, user.hashedPassword);

        if (!checkPassword) {
            errors.push("Wrong password");
            res.status(400).json({ errors });
            return;
        }
        else {
            const userData = user;
            req.session.userInfo = { userToken: user.token, userEmail: user.email };
            res.status(201).send({ userData, message: "Logged in" });
        }
    }
});
// ends



// logout api
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(401).json({ err })
        } else {
            res.status(200).send({ message: "Successfully logged out" });
        }
    })
})
// ends


// api to print sessions
router.get("/getsession", (req, res) => {
    const user = req.session.userInfo;
    if (user) {
        console.log(user);
    } else {
        res.status(200).json({ message: "No session" });
    }
})
// ends here


// =====================================ADMIN MODULE=====================================================


// api to create new author
router.post("/addAuthor", upload.single("image"), async (req, res) => {
    try {

        const authorName = req.body.authorName;
        const authorDesc = req.body.authorDesc;
        const image = req.file.path
        const token = uuidv4();

        const errors = [];

        const cloudinaryResultUpdate = await cloudinary.uploader.upload(image, { folder: "e_library_author_image" }, function (err, result) {
            if (err) {
                res.status(401).json({ err });
            }
        })

        const imageUrl = cloudinaryResultUpdate.secure_url

        if (!authorName) {
            errors.push("Please enter the author name");
        }
        if (!authorDesc) {
            errors.push("Please enter some description about author");
        }
        if (!image) {
            errors.push("Please upload an image")
        }

        const authorSave = new Author({
            authorName,
            authorDesc,
            image: imageUrl,
            token
        });

        const savedUser = await authorSave.save();

        if (!savedUser) {
            res.status(401).json({ message: "User not saved" });
        } else {
            res.status(200).json({ message: "User has been registered" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ error });
    }

})



// api to create new category
router.post("/addCategory", upload.single("image"), async (req, res) => {
    try {

        const categoryName = req.body.categoryName;
        const categoryDesc = req.body.categoryDesc;
        const image = req.file.path
        const token = uuidv4();

        const errors = [];

        const cloudinaryResultUpdate = await cloudinary.uploader.upload(image, { folder: "e_library_category_image" }, function (err, result) {
            if (err) {
                res.status(401).json({ err });
            }
        })

        const imageUrl = cloudinaryResultUpdate.secure_url

        if (!categoryName) {
            errors.push("Please enter the author name");
        }
        if (!categoryDesc) {
            errors.push("Please enter some description about author");
        }
        if (!image) {
            errors.push("Please upload an image")
        }

        const categorySave = new Category({
            categoryName,
            categoryDesc,
            image: imageUrl,
            token
        });

        const savedCategory = await categorySave.save();

        if (!savedCategory) {
            res.status(401).json({ message: "User not saved" });
        } else {
            res.status(200).json({ message: "User has been registered" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ error });
    }

})


// api to get all authors
router.get("/addAuthor", (req, res) => {
    Author.find()
        .exec()
        .then((data) => {
            res.status(200).json({ data });
        })
        .catch((error) => {
            res.status(401).json({ error });
        })
})


// api to get all categories
router.get("/addCategory", (req, res) => {
    Category.find()
        .exec()
        .then((data) => {
            res.status(200).json({ data });
        })
        .catch((error) => {
            res.status(401).json({ error });
        })
})

// api to add books by admin

router.post("/addBooks", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const bookName = req.body.bookName;
        const bookDesc = req.body.bookDesc;
        const token = uuidv4();
        const bookCategoryName = req.body.bookCategoryName;
        const bookAuthorName = req.body.bookAuthorName;
        const bookCategoryToken = req.body.bookCategoryToken;
        const bookAuthorToken = req.body.bookAuthorToken;

        const filesToUpload = [
            { path: req.files.image[0].path, folder: 'book_upload_image' },
            { path: req.files.bookFile[0].path, folder: 'book_file' },
        ]

        const errors = [];

        if (!bookName) {
            errors.push("Please enter book name");
            return res.status(400).json({ errors });
        }
        if (!bookDesc) {
            errors.push("Please enter book description");
            return res.status(400).json({ errors });
        }
        if (!bookCategoryName) {
            errors.push("Please choose book category name");
            return res.status(400).json({ errors });
        }
        if (!bookAuthorName) {
            errors.push("Please choose book Author name");
            return res.status(400).json({ errors });
        }

        const uploadFiles = await Promise.all(filesToUpload.map(async ({ path, folder }) => {
            try {
                const result = await cloudinary.uploader.upload(path, { folder });
                return { folder, result };
            } catch (error) {
                throw error;
            }
        }));

        const imageUrl = uploadFiles[0].result.secure_url;
        console.log(imageUrl);
        const bookUrl = uploadFiles[1].result.secure_url;
        const bookpublic = uploadFiles[1].result.public_id;

        const bookSave = new Book({
            bookName,
            bookDesc,
            image: imageUrl,
            bookFile: bookUrl,
            bookpublicId: bookpublic,
            token,
            bookAuthorName,
            bookCategoryName,
            bookAuthorToken,
            bookCategoryToken
        })

        const bookSaved = await bookSave.save();

        if (bookSaved) {
            res.status(200).json({ message: "Book has been saved" });
        } else {
            res.status(401).json({ message: "Book has not been added" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ error });
    }
})

// ends here


// api to get all books
router.get("/allBooks", (req, res) => {
    Book.find()
        .exec()
        .then((data) => {
            res.status(200).json({ data });
        })
        .catch((error) => {
            res.status(401).json({ error });
        })
})

// ends here



// api to get books by category
router.get("/categoricalBooks/:token", async (req, res) => {
    const token = req.params.token;

    const categoryBooks = await Book.find({ bookCategoryToken: token });

    if (categoryBooks) {
        res.status(200).json({ categoryBooks });
    } else {
        res.status(401).json({ message: "No books by this category" });
    }
})

// ends here


// api to get books by category
router.get("/authorBooks/:token", async (req, res) => {
    const token = req.params.token;

    const authorrBooks = await Book.find({ bookAuthorToken: token });

    if (authorrBooks) {
        res.status(200).json({ authorrBooks });
    } else {
        res.status(401).json({ message: "No books by this category" });
    }
})

// ends here


// api to buy the book
// first stripe step
// router.post("/cartFirstStep", async (req, res) => {
//     try {
//         const { name, email } = req.body;

//         // Check if a customer with the provided email already exists
//         const existingCustomer = await stripe.customers.list({ email: email, limit: 1 });

//         if (existingCustomer.data.length > 0) {
//             res.status(200).json({ message: 'Customer already exists', customer: existingCustomer.data[0] });
//             return;
//         }

//         // If the customer doesn't exist, create a new customer
//         const customer = await stripe.customers.create({
//             name: name,
//             email: email,
//         });

//         res.status(200).json({ customer });
//     } catch (error) {
//         console.log(error);
//         res.status(401).json({ error });
//     }
// });

// // ends here

// // 2nd stripe step

// router.post("/cartSecondStep", async (req, res) => {
//     try {
//         const {
//             customer_id,
//             card_token,
//         } = req.body;

//         // Attach the token to the customer
//         const card = await stripe.customers.createSource(customer_id, {
//             source: card_token,
//         });

//         res.status(200).json({ card: card.id });
//     } catch (error) {
//         res.status(401).json({ error: error.message });
//     }
// });

// // ends here

// // third step

// router.post("/cartThirdStep", async (req, res)=>{
//     try {
//         const createCharge = await stripe.charges.create({
//             receipt_email:req.body.email,
//             amount: parseInt(req.body.amount)*100,
//             currency: 'INR',
//             card: req.body.card_id,
//             customer: req.body.customer_id
//         });
//         res.status(200).json({createCharge})
//     } catch (error) {
//         res.status(401).json({error});
//     }
// })
// ends here


// api to cod of book


router.post("/buyBoook", async (req, res) => {
    try {
        const bookToken = req.body.bookToken;
        const userToken = req.body.userToken;
        const bookingToken = uuidv4();

        const bookBooking = new Bookings({  
            bookToken,
            userToken,
            bookingToken,
        })

        const bookingDone = await bookBooking.save();

        if (bookingDone) {
            res.status(200).json({ bookingDone, message: "Booking has been done" });
        } else {
            res.status(401).json({ message: "Booking has not been saved" });
        }
    } catch (error) {
        res.status(401).json({ error });
    }
})

// ends here

// api to show his bookings to user

router.post("/userBookings", async (req, res)=>{
    try {
        const userToken = req.body.userToken;
    
        // finding users
        const userBookings = await Bookings.find({userToken: userToken})

        // gettig booktokens out
        const onlyBookTokens = userBookings.map((tokens)=> tokens.bookToken);
        
        // then running the query to fetch books from those tokens from books table
        const bookArray = await Promise.all(onlyBookTokens.map(async(token)=>{
            const books = await Book.find({token:token});
            return books.map((bookNames)=>{
                return {
                    bookName: bookNames.bookName,
                    bookImage: bookNames.image,
                }
            });
        }))
        
        const allBooks = bookArray.flat();
    
        if(allBooks.length> 0){
            res.status(200).json({allBooks, message:"All books"});
        }else{
            res.status(401).json({message:"No Books for this user"});
        }
    } catch (error) {
        res.status(401).json({error});
    }
})

// ends here



// api to show all the bookings to the user

// router.get("/allBookings", async (req, res)=>{

// })

// ends here

module.exports = router;