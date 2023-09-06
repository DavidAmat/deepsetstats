import re


def extract_date(url):
    """Extracts the date from the URL."""
    match = re.search(r"\d{4}-\d{2}-\d{2}", url)
    if match:
        return match.group(0)
    else:
        return None


def calculate_date_of_birth(date, age):
    """Calculates the date of birth given the date and age."""
    year = int(date[:4])
    date_of_birth = str(year - age)
    return date_of_birth


def create_link_flag_image(country_code):
    """Creates a link to the ATP Tour flag image."""
    link = (
        "https://www.atptour.com/en/~/media/images/flags/"
        + country_code.lower()
        + ".svg"
    )
    return link
