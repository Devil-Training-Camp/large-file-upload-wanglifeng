declare module "*.vue" {
    import { DefineComponent } from "./shim-vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}