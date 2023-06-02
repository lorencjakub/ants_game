export type TFormField = {
    label: string,
    defaultvalue: string | number | null | boolean | string[] | number[],
    type?: "checkbox" | "select" | "text" | "number" | "binded_slider" | "slider" | "multiselect",
    selectvalues?: { [value: string | number] : any },
    selectdefaultvalue?: string | number,
    required?: boolean,
    disabled?: boolean,
    min?: number,
    max?: number
}

export interface IFormFields {
    [name: string] : TFormField
}

export interface IFormData {
    [name: string] : TFormField["defaultvalue"]
}