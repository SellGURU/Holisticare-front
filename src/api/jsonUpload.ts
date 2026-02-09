function dataToJsonFile(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return new File([blob], filename, { type: 'application/json' });
}

type UploadMeta = {
  base_file: boolean;
  include_clinics_emails: string[]; // will be appended multiple times
};

class JsonUploadApi {
  static BASE_URL = 'https://vercel-backend-one-roan.vercel.app'; // set this

  static getToken(): string | null {
    return null; // or localStorage.getItem("token")
  }

  static async postFormData(path: string, form: FormData) {
    const url = `${this.BASE_URL}${path}`;
    const token = this.getToken();

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // ❌ DON'T set Content-Type for FormData
      },
      body: form,
    });

    const text = await res.text();
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      const msg =
        (parsed && (parsed.message || parsed.error || parsed.detail)) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return parsed;
  }

  static buildForm(file: File, meta: UploadMeta) {
    const form = new FormData();

    // ✅ match Postman keys:
    meta.include_clinics_emails.forEach((email) => {
      form.append('include_clinics_emails', email);
    });
    form.append('file', file);
    form.append('base_file', meta.base_file ? 'true' : 'false');

    return form;
  }

  static uploadMore_info(data: any, meta: UploadMeta) {
    const file = dataToJsonFile(data, 'more_info_rules.json');
    const form = this.buildForm(file, meta);
    return this.postFormData('/holisticare_test/upload/more_info', form);
  }

  static uploadCategories(data: any, meta: UploadMeta) {
    const file = dataToJsonFile(data, 'benchmark_areas.json');
    const form = this.buildForm(file, meta);
    return this.postFormData('/holisticare_test/upload/categories', form);
  }

  static uploadUnit_mapping(data: any, meta: UploadMeta) {
    const file = dataToJsonFile(data, 'unit_mapping.json');
    const form = this.buildForm(file, meta);
    return this.postFormData('/holisticare_test/upload/unit_mapping', form);
  }

  static uploadBiomarker_mapping(data: any, meta: UploadMeta) {
    const file = dataToJsonFile(data, 'biomarker_mapping.json');
    const form = this.buildForm(file, meta);
    return this.postFormData(
      '/holisticare_test/upload/biomarker_mapping',
      form,
    );
  }
}
export default JsonUploadApi;
