import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { FormDatePicker } from "./form-date-picker";
import { FormImageKitUploader } from "./form-image-uploader";
import { FormInput } from "./form-input";
import { FormPassword } from "./form-password";
import { FormSelect } from "./form-select";
import { SubscribeButton } from "./form-subscribe-button";
import { FormTextarea } from "./form-textarea";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Select: FormSelect,
    Textarea: FormTextarea,
    Password: FormPassword,
    ImageUploader: FormImageKitUploader,
    DatePicker: FormDatePicker,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm, useFieldContext, useFormContext };
