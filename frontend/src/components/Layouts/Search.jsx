import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";

const Search = () => {

    const [keyword, setKeyword] = useState('');
    let navigate = useNavigate();

    const searchHandler = (e) => {
        e.preventDefault()
        if (keyword.trim()) {
           navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`)
        } else {
            navigate('/products')
        }
    }

    return (
        <form onSubmit={searchHandler} className="w-100">
            <div className="input-group">
                <input
                    type="text"
                    id="search_field"
                    className="form-control"
                    placeholder="Enter Product Name ..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <div className="input-group-append">
                    <button id="search_btn" className="btn" type="submit">
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </form>
    )
}

export default Search