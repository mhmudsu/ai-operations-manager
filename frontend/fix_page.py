import re

# Read current file
with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add imports after line 8 (after api import)
import_marker = "import { api } from '@/lib/api-client'"
if "import { CSVUpload }" not in content:
    content = content.replace(
        import_marker,
        import_marker + "\nimport { CSVUpload } from '@/components/orders/CSVUpload'\nimport { NewOrderModal } from '@/components/orders/NewOrderModal'"
    )

# 2. Add state after refreshTrigger
state_marker = "const [refreshTrigger, setRefreshTrigger] = useState(0)"
if "showNewOrderModal" not in content:
    content = content.replace(
        state_marker,
        state_marker + "\n  const [showNewOrderModal, setShowNewOrderModal] = useState(false)\n  const [showCSVUpload, setShowCSVUpload] = useState(false)"
    )

# 3. Add onClick to Upload CSV button
content = re.sub(
    r'(<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all hover:shadow">)\s*📤 Upload CSV',
    r'<button onClick={() => setShowCSVUpload(!showCSVUpload)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all hover:shadow">\n                  📤 Upload CSV',
    content
)

# 4. Add onClick to Nieuwe Order button
content = re.sub(
    r'(<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">)\s*\+ Nieuwe Order',
    r'<button onClick={() => setShowNewOrderModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">\n                  + Nieuwe Order',
    content
)

# 5. Add modals before closing tags (find last </div></div>) before )})
modal_code = '''
        {/* CSV Upload Section */}
        {showCSVUpload && (
          <div className="mb-8">
            <CSVUpload 
              onUploadComplete={() => {
                setRefreshTrigger(prev => prev + 1)
                setShowCSVUpload(false)
              }}
            />
          </div>
        )}

        {/* New Order Modal */}
        <NewOrderModal
          isOpen={showNewOrderModal}
          onClose={() => setShowNewOrderModal(false)}
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1)
          }}
        />'''

# Find the right place - before the last </div></div>)}
if "CSV Upload Section" not in content:
    # Find pattern: </div>\n        </div>\n      </div>\n    </div>\n  )\n}
    pattern = r'(</div>\s*</div>\s*</div>\s*</div>\s*\)\s*})\s*$'
    replacement = modal_code + r'\n      </div>\n    </div>\n  )\n}'
    content = re.sub(pattern, replacement, content)

# Write fixed file
with open('app/page.tsx', 'w') as f:
    f.write(content)

print("✅ Fixed app/page.tsx!")
