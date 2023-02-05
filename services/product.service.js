const ProductRepository = require('../repositories/product.repository.js')
const {Products} = require('../models/index.js')

class ProductService {
    productRepository = new ProductRepository(Products)

    // 상품 등록
    productRegister = async(productName, productStock, productPrice, productImgUrl, productType) => {
        try {
            const newProduct = await this.productRepository.productRegister(
                productName,
                productStock,
                productPrice,
                productImgUrl,
                productType
            )
            return newProduct
        } catch (error) {
            throw error;
        }
    }

    // 상품 조회
    readProduct = async() => {
        try {
            const allProduct = await this.productRepository.readProduct()
            return allProduct
        } catch (error) {
            throw error;
        }
    }

    // 상품 상세 조회
    getOneProduct = async(productId) => {
        try {
            const getOneProduct = await this.productRepository.getOneProduct(productId);
            return getOneProduct;
        } catch (error) {
            throw error;
        }
    }

    // 상품 수정
    getUpdateProduct = async(productId, productName, productStock, productPrice, productImgUrl, productType) => {
        try {
            const updateProduct = await this.productRepository.getUpdateProduct(
                productId,
                productName,
                productStock,
                productPrice,
                productImgUrl,
                productType
            )
            return updateProduct
        } catch (error) {
            throw error
        }
    }

    // 상품 삭제
    getXProduct = async(productId) => {
        try {
            const getXProduct = await this.productRepository.getXProduct(productId)
            return getXProduct
        } catch (error) {
            throw error
        }
    }
}

module.exports = ProductService;