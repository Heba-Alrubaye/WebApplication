const productModel = require("../product.model");

exports.createProduct=(req, res, next) =>{
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const prod = new Product({id:id, name:name, price:price});
        prod.save().then(result =>{
            res.status(201).json({
                message: "Product created!",
                product:result
            })
        }).catch(err =>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getProduct=(req,res,next) =>{
    const productId = req.params.productId;
    Product.findOne({id:productId}).then(product =>{
        console.log(product)
        if(!product){
            const error = new Error("Can't find the post/product");
            error.statusCode = 404;
            throw error;
        }
        else{
            res.status(200).json({message: "Product found!" ,product:product})
        }
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;

        }
        next(err);
    });
}