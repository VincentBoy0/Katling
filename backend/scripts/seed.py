"""
Script to populate database with sample data for testing.
Inserts topics, lessons, sections, questions, words, posts, and daily missions.
"""
import asyncio
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

from sqlalchemy import text
from database.session import engine
# from models.lesson import Topic, Lesson, LessonSection, Question, LessonType, LessonStatus, QuestionType
# from models.vocab import Word
# from models.post import Post, PostStatus
# from models.daily_mission import DailyMission, MissionType


async def get_default_user_id():
    """Get the first user ID from the database to use as creator."""
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id FROM users ORDER BY id LIMIT 1"))
        row = result.fetchone()
        if row:
            return row[0]
        else:
            print("❌ No users found in database. Please create a user first.")
            sys.exit(1)


async def insert_sample_data():
    """Insert sample data from JSON file."""
    
    # Load sample data
    json_path = Path(__file__).parent / "sample_data.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Get default user to assign as creator
    default_user_id = await get_default_user_id()
    print(f"📌 Using user ID {default_user_id} as creator for all content\n")
    
    async with engine.begin() as conn:
        inserted_count = 0
        
        # Insert Topics
        print("📚 Inserting Topics...")
        for topic_data in data['topics']:
            await conn.execute(
                text("""
                    INSERT INTO topics (id, name, description, order_index, status, created_by, created_at, is_deleted)
                    VALUES (:id, :name, :description, :order_index, :status, :created_by, :created_at, :is_deleted)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': topic_data['id'],
                    'name': topic_data['name'],
                    'description': topic_data['description'],
                    'order_index': topic_data['order_index'],
                    'status': topic_data['status'],
                    'created_by': default_user_id,
                    'created_at': datetime.now(timezone.utc),
                    'is_deleted': False
                }
            )
            print(f"  ✓ {topic_data['name']}")
            inserted_count += 1
        
        # Insert Lessons
        print("\n📖 Inserting Lessons...")
        for lesson_data in data['lessons']:
            await conn.execute(
                text("""
                    INSERT INTO lessons (id, topic_id, type, title, description, order_index, status, content, created_by, created_at, is_deleted)
                    VALUES (:id, :topic_id, :type, :title, :description, :order_index, :status, CAST(:content AS jsonb), :created_by, :created_at, :is_deleted)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': lesson_data['id'],
                    'topic_id': lesson_data['topic_id'],
                    'type': lesson_data['type'],
                    'title': lesson_data['title'],
                    'description': lesson_data['description'],
                    'order_index': lesson_data['order_index'],
                    'status': lesson_data['status'],
                    'content': json.dumps(lesson_data.get('content')),
                    'created_by': default_user_id,
                    'created_at': datetime.now(timezone.utc),
                    'is_deleted': False
                }
            )
            print(f"  ✓ {lesson_data['title']}")
            inserted_count += 1
        
        # Insert Lesson Sections
        print("\n📄 Inserting Lesson Sections...")
        for section_data in data['lesson_sections']:
            await conn.execute(
                text("""
                    INSERT INTO lesson_sections (id, lesson_id, title, order_index, content, created_by, created_at, is_deleted)
                    VALUES (:id, :lesson_id, :title, :order_index, CAST(:content AS jsonb), :created_by, :created_at, :is_deleted)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': section_data['id'],
                    'lesson_id': section_data['lesson_id'],
                    'title': section_data['title'],
                    'order_index': section_data['order_index'],
                    'content': json.dumps(section_data.get('content')),
                    'created_by': default_user_id,
                    'created_at': datetime.now(timezone.utc),
                    'is_deleted': False
                }
            )
            print(f"  ✓ {section_data['title']}")
            inserted_count += 1
        
        # Insert Questions
        print("\n❓ Inserting Questions...")
        for question_data in data['questions']:
            await conn.execute(
                text("""
                    INSERT INTO questions (id, section_id, type, order_index, status, content, correct_answer, explanation, created_by, created_at, is_deleted)
                    VALUES (:id, :section_id, :type, :order_index, :status, CAST(:content AS jsonb), CAST(:correct_answer AS jsonb), :explanation, :created_by, :created_at, :is_deleted)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': question_data['id'],
                    'section_id': question_data['section_id'],
                    'type': question_data['type'],
                    'order_index': question_data['order_index'],
                    'status': question_data['status'],
                    'content': json.dumps(question_data.get('content')),
                    'correct_answer': json.dumps(question_data.get('correct_answer')),
                    'explanation': question_data.get('explanation'),
                    'created_by': default_user_id,
                    'created_at': datetime.now(timezone.utc),
                    'is_deleted': False
                }
            )
            print(f"  ✓ Question {question_data['id']} ({question_data['type']})")
            inserted_count += 1
        
        # Insert Vocabs
        print("\n📝 Inserting Vocabulary Words...")
        for vocab_data in data['vocabs']:
            await conn.execute(
                text("""
                    INSERT INTO vocabs (id, word, phonetic, definition, created_at)
                    VALUES (:id, :word, :phonetic, CAST(:definition AS jsonb), :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': vocab_data['id'],
                    'word': vocab_data['word'],
                    'phonetic': vocab_data.get('phonetic'),
                    'definition': json.dumps(vocab_data.get('definition')),
                    'created_at': datetime.now(timezone.utc)
                }
            )
            print(f"  ✓ {vocab_data['word']}")
            inserted_count += 1
        
        # Insert Posts
        print("\n💬 Inserting Posts...")
        for post_data in data['posts']:
            await conn.execute(
                text("""
                    INSERT INTO posts (id, user_id, content, status, like_count, comment_count, created_at, is_deleted)
                    VALUES (:id, :user_id, CAST(:content AS jsonb), :status, :like_count, :comment_count, :created_at, :is_deleted)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': post_data['id'],
                    'user_id': default_user_id,
                    'content': json.dumps(post_data['content']),
                    'status': post_data['status'],
                    'like_count': 0,
                    'comment_count': 0,
                    'created_at': datetime.now(timezone.utc),
                    'is_deleted': False
                }
            )
            print(f"  ✓ {post_data['content']['title']}")
            inserted_count += 1
        
        # Insert Daily Missions
        print("\n🎯 Inserting Daily Missions...")
        for mission_data in data['daily_missions']:
            await conn.execute(
                text("""
                    INSERT INTO daily_missions (id, type, description, target_value, xp_reward, lesson_type)
                    VALUES (:id, :type, :description, :target_value, :xp_reward, :lesson_type)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    'id': mission_data['id'],
                    'type': mission_data['type'],
                    'description': mission_data['description'],
                    'target_value': mission_data['target_value'],
                    'xp_reward': mission_data['xp_reward'],
                    'lesson_type': mission_data.get('lesson_type')
                }
            )
            print(f"  ✓ {mission_data['description']}")
            inserted_count += 1
        
        print(f"\n✅ Successfully inserted {inserted_count} records")


async def main():
    """Main entry point."""
    print("=" * 60)
    print("DATABASE SEED - Insert Sample Data")
    print("=" * 60)
    print("\nThis will insert sample topics, lessons, questions,")
    print("vocabulary, posts, and daily missions for testing.\n")
    
    confirm = input("Type 'yes' to continue: ").strip().lower()
    
    if confirm != 'yes':
        print("❌ Operation cancelled")
        return
    
    print()
    await insert_sample_data()
    print("\n" + "=" * 60)
    print("Seed complete! Your database is ready for testing.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
