import PyPDF2

reader = PyPDF2.PdfFileReader(r'E:\4twin\_stage\CoolUp_Project_Review_.pdf')
pages = reader.getNumPages()
print(f"Total pages: {pages}")
print("=" * 80)

for i in range(pages):
    page = reader.getPage(i)
    text = page.extractText()
    print(f"\n--- PAGE {i+1} ---")
    print(text)
