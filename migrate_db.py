import sqlite3

def upgrade_db():
    conn = sqlite3.connect('grievance.db')
    cursor = conn.cursor()
    
    # 1. Add auth_provider to users
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local'")
        print("Added auth_provider to users.")
    except sqlite3.OperationalError as e:
        print(f"Column auth_provider might already exist: {e}")

    # 2. Add submitted_by to complaints
    try:
        cursor.execute("ALTER TABLE complaints ADD COLUMN submitted_by VARCHAR(150)")
        print("Added submitted_by to complaints.")
    except sqlite3.OperationalError as e:
        print(f"Column submitted_by might already exist: {e}")

    # Optionally, we can try to backfill submitted_by based on user_id
    try:
        cursor.execute('''
            UPDATE complaints
            SET submitted_by = (
                SELECT name FROM users WHERE users.id = complaints.user_id
            )
            WHERE submitted_by IS NULL
        ''')
        print("Backfilled existing complaints with user names.")
    except Exception as e:
        print(f"Failed to backfill submitted_by: {e}")
        
    # 3. Add officer_notes to complaints
    try:
        cursor.execute("ALTER TABLE complaints ADD COLUMN officer_notes TEXT")
        print("Added officer_notes to complaints.")
    except sqlite3.OperationalError as e:
        print(f"Column officer_notes might already exist: {e}")

    conn.commit()
    conn.close()
    print("Database upgrade complete.")

if __name__ == '__main__':
    upgrade_db()
