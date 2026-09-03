import { createContext, useContext } from "react";

/** Danh mục sản phẩm (đã tải ở App) — để Header/CategoryRail tự sinh cột "Thương hiệu". */
export const CatalogCtx = createContext({ products: [], categories: [], brands: [] });
export const useCatalog = () => useContext(CatalogCtx);
