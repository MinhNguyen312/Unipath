export interface EvaluationCombination {
    label: string;
    value: string[];
  }


  
export const evaluationCombinations: EvaluationCombination[] = [
    { label: 'A00', value: ['Toán', 'Vật Lý', 'Hóa Học'] },
    { label: 'A01', value: ['Toán', 'Vật Lý', 'Tiếng Anh'] },
    { label: 'A02', value: ['Toán', 'Vật Lý', 'Sinh Học'] },
    { label: 'A03', value: ['Toán', 'Vật Lý', 'Lịch Sử'] },
    { label: 'A04', value: ['Toán', 'Vật Lý', 'Địa Lí'] },
    { label: 'A05', value: ['Toán', 'Hóa Học', 'Lịch Sử'] },
    { label: 'A06', value: ['Toán', 'Hóa Học', 'Địa Lí'] },
    { label: 'A07', value: ['Toán', 'Lịch Sử', 'Địa Lí'] },
    { label: 'A08', value: ['Toán', 'Lịch Sử', 'GDKTPL'] },
    { label: 'A09', value: ['Toán', 'Địa Lí', 'GDKTPL'] },
    { label: 'A10', value: ['Toán', 'Vật Lý', 'GDKTPL'] },
    { label: 'A11', value: ['Toán', 'Hóa Học', 'GDKTPL'] },
    { label: 'B00', value: ['Toán', 'Hóa Học', 'Sinh Học'] },
    { label: 'B01', value: ['Toán', 'Sinh Học', 'Lịch Sử'] },
    { label: 'B02', value: ['Toán', 'Sinh Học', 'Địa Lí'] },
    { label: 'B03', value: ['Toán', 'Sinh Học', 'Ngữ Văn'] },
    { label: 'B04', value: ['Toán', 'Sinh Học', 'GDKTPL'] },
    { label: 'B05', value: ['Toán', 'Sinh Học', 'KHXH'] },
    { label: 'B08', value: ['Toán', 'Sinh Học', 'Tiếng Anh'] },
  ];