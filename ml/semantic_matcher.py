from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


def calculate_similarity(skill1, skill2):

    embeddings = model.encode([
        skill1,
        skill2
    ])

    similarity = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]]
    )[0][0]

    return similarity


if __name__ == "__main__":

    pairs = [
        ("ML", "Machine Learning"),
        ("React.js", "React"),
        ("LLM", "Large Language Models"),
        ("Python", "SQL"),
        ("Docker", "Cloud Computing")
    ]

    for skill1, skill2 in pairs:

        score = calculate_similarity(
            skill1,
            skill2
        )

        print(
            f"{skill1} ↔ {skill2} : "
            f"{score:.3f}"
        )